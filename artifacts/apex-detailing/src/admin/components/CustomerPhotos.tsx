import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";

export type BookingPhotoMeta = {
  id: number;
  bookingId: number;
  mime: string;
};

export function useAdminBookingPhotoIndex(token: string) {
  return useQuery({
    queryKey: ["admin-booking-photos"],
    queryFn: async (): Promise<BookingPhotoMeta[]> => {
      const res = await fetch("/api/admin/booking-photos", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { photos?: BookingPhotoMeta[] };
      return json.photos ?? [];
    },
    staleTime: 20_000,
  });
}

export function photoIdsForBooking(
  photos: BookingPhotoMeta[] | undefined,
  bookingId: number,
): number[] {
  return (photos ?? []).filter((p) => p.bookingId === bookingId).map((p) => p.id);
}

function useAdminPhotoUrl(token: string, bookingId: number, photoId: number) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    void fetch(`/api/admin/bookings/${bookingId}/photos/${photoId}`, {
      headers: { "x-admin-token": token },
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, bookingId, photoId]);

  return url;
}

export function AdminBookingPhoto({
  token,
  bookingId,
  photoId,
  className,
  onClick,
}: {
  token: string;
  bookingId: number;
  photoId: number;
  className?: string;
  onClick?: () => void;
}) {
  const url = useAdminPhotoUrl(token, bookingId, photoId);
  if (!url) {
    return <div className={`bg-white/[0.04] animate-pulse ${className ?? ""}`} />;
  }
  const img = (
    <img src={url} alt="Customer vehicle" className={`object-cover ${className ?? ""}`} />
  );
  if (!onClick) return img;
  return (
    <button type="button" onClick={onClick} className="block w-full h-full">
      {img}
    </button>
  );
}

export function CustomerPhotoGallery({
  token,
  bookingId,
  photoIds,
}: {
  token: string;
  bookingId: number;
  photoIds: number[];
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  if (photoIds.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photoIds.map((id) => (
          <div key={id} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
            <AdminBookingPhoto
              token={token}
              bookingId={bookingId}
              photoId={id}
              className="w-full h-full"
              onClick={() => setOpenId(id)}
            />
          </div>
        ))}
      </div>
      {openId != null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close photo"
            onClick={() => setOpenId(null)}
          />
          <div className="relative max-w-3xl w-full max-h-[90vh]">
            <AdminBookingPhoto
              token={token}
              bookingId={bookingId}
              photoId={openId}
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute top-2 right-2 w-9 h-9 rounded-lg bg-black/60 text-white flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomerPhotoBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#23B9FF]">
      <Camera className="w-3 h-3" />
      {count} photo{count === 1 ? "" : "s"}
    </span>
  );
}
