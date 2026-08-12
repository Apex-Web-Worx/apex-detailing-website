import { db, bookingPhotosTable, bookingsTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";

export const MAX_PHOTOS_PER_BOOKING = 3;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
/** Keep photos through the appointment, then drop them 2 hours after it ends. */
export const PHOTO_GRACE_MS = 2 * 60 * 60 * 1000;

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

export function detectImageMime(buf: Buffer): ImageMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function countBookingPhotos(bookingId: number): Promise<number> {
  const rows = await db
    .select({ id: bookingPhotosTable.id })
    .from(bookingPhotosTable)
    .where(eq(bookingPhotosTable.bookingId, bookingId));
  return rows.length;
}

export async function insertBookingPhoto(args: {
  bookingId: number;
  mime: ImageMime;
  data: Buffer;
}): Promise<{ id: number; mime: ImageMime }> {
  const [row] = await db
    .insert(bookingPhotosTable)
    .values({
      bookingId: args.bookingId,
      mime: args.mime,
      data: args.data,
    })
    .returning({ id: bookingPhotosTable.id, mime: bookingPhotosTable.mime });
  if (!row) throw new Error("Failed to save photo");
  return { id: row.id, mime: args.mime };
}

export async function listBookingPhotoMeta(bookingId: number): Promise<
  Array<{ id: number; mime: string }>
> {
  return db
    .select({
      id: bookingPhotosTable.id,
      mime: bookingPhotosTable.mime,
    })
    .from(bookingPhotosTable)
    .where(eq(bookingPhotosTable.bookingId, bookingId));
}

export async function listAllBookingPhotoMeta(): Promise<
  Array<{ id: number; bookingId: number; mime: string }>
> {
  return db
    .select({
      id: bookingPhotosTable.id,
      bookingId: bookingPhotosTable.bookingId,
      mime: bookingPhotosTable.mime,
    })
    .from(bookingPhotosTable);
}

export async function getBookingPhoto(
  bookingId: number,
  photoId: number,
): Promise<{ mime: string; data: Buffer } | null> {
  const [row] = await db
    .select({
      mime: bookingPhotosTable.mime,
      data: bookingPhotosTable.data,
    })
    .from(bookingPhotosTable)
    .where(
      and(
        eq(bookingPhotosTable.id, photoId),
        eq(bookingPhotosTable.bookingId, bookingId),
      ),
    );
  if (!row) return null;
  const data = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data as Uint8Array);
  return { mime: row.mime, data };
}

export async function deletePhotosForBooking(bookingId: number): Promise<void> {
  await db
    .delete(bookingPhotosTable)
    .where(eq(bookingPhotosTable.bookingId, bookingId));
}

export function photosExpireAt(scheduledAt: Date, durationMinutes: number): Date {
  return new Date(scheduledAt.getTime() + durationMinutes * 60_000 + PHOTO_GRACE_MS);
}

export async function purgeExpiredBookingPhotos(): Promise<number> {
  const rows = await db
    .select({
      photoId: bookingPhotosTable.id,
      scheduledAt: bookingsTable.scheduledAt,
      durationMinutes: bookingsTable.serviceDurationMinutes,
      status: bookingsTable.status,
    })
    .from(bookingPhotosTable)
    .innerJoin(bookingsTable, eq(bookingsTable.id, bookingPhotosTable.bookingId));

  const now = Date.now();
  const toDelete: number[] = [];
  for (const row of rows) {
    if (row.status === "cancelled") {
      toDelete.push(row.photoId);
      continue;
    }
    if (photosExpireAt(row.scheduledAt, row.durationMinutes).getTime() <= now) {
      toDelete.push(row.photoId);
    }
  }
  if (toDelete.length === 0) return 0;
  await db
    .delete(bookingPhotosTable)
    .where(inArray(bookingPhotosTable.id, toDelete));
  return toDelete.length;
}
