export const MAX_BOOKING_PHOTOS = 3;
export const MAX_BOOKING_PHOTO_BYTES = 2 * 1024 * 1024;

export type PickedPhoto = {
  id: string;
  blob: Blob;
  previewUrl: string;
  name: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export async function compressImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (JPEG, PNG, or WebP).");
  }
  const img = await loadImage(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that photo.");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82);
  });
  if (!blob) throw new Error("Could not process that photo.");
  if (blob.size > MAX_BOOKING_PHOTO_BYTES) {
    throw new Error("That photo is still too large after shrinking. Try another.");
  }
  return blob;
}

export async function pickPhotosFromFiles(
  files: FileList | File[],
  existingCount: number,
): Promise<PickedPhoto[]> {
  const room = MAX_BOOKING_PHOTOS - existingCount;
  const incoming = Array.from(files).slice(0, Math.max(0, room));
  const out: PickedPhoto[] = [];
  for (const file of incoming) {
    const blob = await compressImageFile(file);
    out.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      blob,
      previewUrl: URL.createObjectURL(blob),
      name: file.name,
    });
  }
  return out;
}

export function revokePickedPhotos(photos: PickedPhoto[]) {
  for (const photo of photos) URL.revokeObjectURL(photo.previewUrl);
}

export async function uploadBookingPhotos(
  bookingId: number,
  manageToken: string,
  photos: PickedPhoto[],
): Promise<void> {
  for (const photo of photos) {
    const res = await fetch(
      `/api/booking/bookings/${bookingId}/photos?token=${encodeURIComponent(manageToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: photo.blob,
      },
    );
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(json?.message ?? "Could not upload vehicle photos.");
    }
  }
}
