import { useState } from "react";
import { Link } from "wouter";
import type { Booking } from "@workspace/api-client-react";
import { MoreHorizontal, Phone } from "lucide-react";
import { formatDuration, formatTime12h } from "@/lib/format";
import { displayStatus, notesPreview, bookingShopDate, bookingShopTime } from "../utils";
import { StatusBadge } from "./ui";
import { useAdmin } from "../context";
import {
  AdminBookingPhoto,
  CustomerPhotoBadge,
  photoIdsForBooking,
  useAdminBookingPhotoIndex,
} from "./CustomerPhotos";

export default function AppointmentRow({
  booking,
  onView,
  onEdit,
  onCancel,
}: {
  booking: Booking;
  onView: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}) {
  const { token } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = photoIdsForBooking(photosQuery.data, booking.id);
  const photoCount = photoIds.length;
  const [menu, setMenu] = useState(false);
  const status = displayStatus(booking);
  const preview = notesPreview(booking.notes);
  const canAct = status === "confirmed";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onView} className="flex-1 min-w-0 text-left touch-manipulation">
          <div className="flex items-start gap-3">
            {photoIds[0] ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <AdminBookingPhoto
                  token={token}
                  bookingId={booking.id}
                  photoId={photoIds[0]}
                  className="w-full h-full"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white shrink-0">
                  {formatTime12h(bookingShopTime(booking))}
                </span>
                <StatusBadge status={status} />
              </div>
              <p className="mt-0.5 font-semibold text-white leading-snug">{booking.serviceName}</p>
              <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
                {booking.customerName} · {booking.vehicle}
              </p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                {bookingShopDate(booking)} · {formatDuration(booking.serviceDurationMinutes)}
              </p>
              <CustomerPhotoBadge count={photoCount} />
              {preview && (
                <p className="mt-1 text-xs text-[#9CA3AF]/80 truncate">{preview}</p>
              )}
            </div>
          </div>
        </button>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <a
            href={`tel:${booking.phone}`}
            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#23B9FF] hover:bg-white/5 touch-manipulation"
            aria-label={`Call ${booking.customerName}`}
          >
            <Phone className="w-4 h-4" />
          </a>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 touch-manipulation"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menu && (
              <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border border-white/10 bg-[#0B0B0B] py-1 z-20 shadow-xl">
                <button
                  type="button"
                  className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                  onClick={() => {
                    setMenu(false);
                    onView();
                  }}
                >
                  View
                </button>
                {canAct && onEdit && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                    onClick={() => {
                      setMenu(false);
                      onEdit();
                    }}
                  >
                    Edit
                  </button>
                )}
                {booking.manageToken && (
                  <Link
                    href={`/manage/${booking.id}?token=${booking.manageToken}`}
                    className="block px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                  >
                    Customer link
                  </Link>
                )}
                {canAct && onCancel && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 min-h-11"
                    onClick={() => {
                      setMenu(false);
                      onCancel();
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
