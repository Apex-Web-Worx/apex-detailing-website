import { useEffect } from "react";
import { Link } from "wouter";
import { Mail, MessageSquare, Phone, X } from "lucide-react";
import { formatDateTimeLong, formatDuration } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingIso, displayStatus } from "../utils";
import { GhostButton, StatusBadge } from "./ui";
import {
  CustomerPhotoGallery,
  photoIdsForBooking,
  useAdminBookingPhotoIndex,
} from "./CustomerPhotos";

export default function AppointmentDetailDrawer() {
  const { detail, setDetail, setEditing, cancelBooking, token } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = detail ? photoIdsForBooking(photosQuery.data, detail.id) : [];

  useEffect(() => {
    if (!detail) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [detail, setDetail]);

  if (!detail) return null;
  const status = displayStatus(detail);
  const canAct = status === "confirmed";
  const smsHref = `sms:${detail.phone}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close details"
        onClick={() => setDetail(null)}
      />
      <aside className="relative w-full sm:max-w-md h-[92dvh] sm:h-full bg-[#0B0B0B] border-t sm:border-t-0 sm:border-l border-white/10 rounded-t-2xl sm:rounded-none flex flex-col pt-[env(safe-area-inset-top)]">
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mt-2 shrink-0" />
        <div className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Appointment</p>
            <h2 className="text-lg font-bold truncate">#{String(detail.id).padStart(5, "0")}</h2>
          </div>
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="w-11 h-11 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1 pb-4">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer</h3>
            <p className="font-semibold text-white text-lg">{detail.customerName}</p>
            <a
              href={`tel:${detail.phone}`}
              className="mt-3 flex items-center gap-3 min-h-12 px-3 rounded-xl border border-white/10 text-sm text-white hover:bg-white/5 touch-manipulation"
            >
              <Phone className="w-4 h-4 text-[#23B9FF]" /> {detail.phone}
            </a>
            <a
              href={`mailto:${detail.email}`}
              className="mt-2 flex items-center gap-3 min-h-12 px-3 rounded-xl border border-white/10 text-sm text-white hover:bg-white/5 touch-manipulation"
            >
              <Mail className="w-4 h-4 text-[#23B9FF]" /> {detail.email}
            </a>
            <Link
              href={`/admin/customers/${encodeURIComponent(detail.email.toLowerCase())}`}
              className="inline-block mt-3 text-sm text-[#23B9FF] hover:underline py-1"
            >
              Open customer profile
            </Link>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Vehicle</h3>
            {photoIds.length > 0 ? (
              <div className="mb-3">
                <CustomerPhotoGallery token={token} bookingId={detail.id} photoIds={photoIds} />
                <p className="text-xs text-[#9CA3AF] mt-2">
                  Customer photos — deleted automatically after the appointment.
                </p>
              </div>
            ) : null}
            <p className="text-white">{detail.vehicle}</p>
            <Link
              href={`/admin/vehicles/${encodeURIComponent(`${detail.email.toLowerCase()}||${detail.vehicle.toLowerCase()}`)}`}
              className="inline-block mt-3 text-sm text-[#23B9FF] hover:underline py-1"
            >
              Open vehicle
            </Link>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Booking</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[#9CA3AF] text-xs">Service</dt>
                <dd className="text-white mt-0.5">{detail.serviceName}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF] text-xs">Date & time</dt>
                <dd className="text-white mt-0.5">{formatDateTimeLong(bookingIso(detail))}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF] text-xs">Duration</dt>
                <dd className="text-white mt-0.5">{formatDuration(detail.serviceDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF] text-xs">Status</dt>
                <dd className="mt-1"><StatusBadge status={status} /></dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer notes</h3>
            <p className="text-sm text-white whitespace-pre-wrap">
              {detail.notes?.trim() ? detail.notes : "No notes on this booking."}
            </p>
          </section>
        </div>

        <div className="shrink-0 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#0B0B0B] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${detail.phone}`}
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-[#23B9FF] text-[#050505] text-sm font-semibold touch-manipulation"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <a
              href={smsHref}
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl border border-white/10 text-sm font-semibold text-white touch-manipulation"
            >
              <MessageSquare className="w-4 h-4" /> Text
            </a>
          </div>
          {canAct && (
            <div className="flex gap-2">
              <GhostButton
                type="button"
                className="flex-1"
                onClick={() => {
                  setEditing(detail);
                }}
              >
                Edit
              </GhostButton>
              <GhostButton
                type="button"
                className="flex-1 text-red-400 border-red-500/20 hover:bg-red-500/10"
                onClick={() => cancelBooking(detail.id)}
              >
                Cancel
              </GhostButton>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
