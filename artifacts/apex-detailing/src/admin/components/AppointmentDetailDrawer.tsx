import { useEffect } from "react";
import { Link } from "wouter";
import { Mail, Phone, X } from "lucide-react";
import { formatDateTimeLong, formatDuration } from "@/lib/format";
import VehiclePhoto from "@/components/VehiclePhoto";
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, setDetail]);

  if (!detail) return null;
  const status = displayStatus(detail);
  const canAct = status === "confirmed";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close details"
        onClick={() => setDetail(null)}
      />
      <aside className="relative w-full max-w-md h-full bg-[#0B0B0B] border-l border-white/10 overflow-y-auto">
        <div className="sticky top-0 bg-[#0B0B0B] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Appointment</p>
            <h2 className="text-lg font-bold">#{String(detail.id).padStart(5, "0")}</h2>
          </div>
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="w-9 h-9 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer</h3>
            <p className="font-semibold text-white">{detail.customerName}</p>
            <a href={`tel:${detail.phone}`} className="mt-2 flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white">
              <Phone className="w-4 h-4" /> {detail.phone}
            </a>
            <a href={`mailto:${detail.email}`} className="mt-1 flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white">
              <Mail className="w-4 h-4" /> {detail.email}
            </a>
            <Link
              href={`/admin/customers/${encodeURIComponent(detail.email.toLowerCase())}`}
              className="inline-block mt-3 text-xs text-[#23B9FF] hover:underline"
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
            ) : (
              <>
                <VehiclePhoto vehicle={detail.vehicle} size="hero" showCredit className="mb-3" />
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Photo is a Wikipedia match for the vehicle text — not a picture of this specific car.
                </p>
              </>
            )}
            <p className="text-white mt-2">{detail.vehicle}</p>
            <Link
              href={`/admin/vehicles/${encodeURIComponent(`${detail.email.toLowerCase()}||${detail.vehicle.toLowerCase()}`)}`}
              className="inline-block mt-3 text-xs text-[#23B9FF] hover:underline"
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

          {canAct && (
            <div className="flex gap-2">
              <GhostButton
                type="button"
                onClick={() => {
                  setEditing(detail);
                }}
              >
                Edit
              </GhostButton>
              <GhostButton
                type="button"
                className="text-red-400 border-red-500/20 hover:bg-red-500/10"
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
