import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import type { Booking } from "@workspace/api-client-react";
import { MoreHorizontal, Phone, Check, Play } from "lucide-react";
import { formatDateShort, formatDuration, formatTime12h } from "@/lib/format";
import {
  displayStatus,
  notesPreview,
  bookingShopDate,
  bookingShopTime,
  canMarkCompleted,
  canMarkReady,
  canStartJob,
} from "../utils";
import { StatusBadge } from "./ui";
import { useAdmin } from "../context";
import DetailTimer from "./DetailTimer";
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
  const { token, openReadyModal, startBooking, completeBooking } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = photoIdsForBooking(photosQuery.data, booking.id);
  const photoCount = photoIds.length;
  const [menu, setMenu] = useState(false);
  const status = displayStatus(booking);
  const preview = notesPreview(booking.notes);
  const canAct = status === "confirmed";
  const ready = canMarkReady(booking);
  const canStart = canStartJob(booking);
  const canComplete = canMarkCompleted(booking);
  const date = bookingShopDate(booking);
  const time = formatTime12h(bookingShopTime(booking));
  const showTimer =
    (status === "in_progress" || status === "ready_for_pickup" || status === "completed") &&
    (booking.inProgressAt || booking.detailDurationMinutes != null);

  const primaryAction = canStart ? (
    <StatusAction onClick={() => void startBooking(booking.id)}>
      <Play className="w-4 h-4" /> Start detailing
    </StatusAction>
  ) : ready ? (
    <StatusAction onClick={() => openReadyModal(booking)}>
      <Check className="w-4 h-4" /> Ready for pickup
    </StatusAction>
  ) : canComplete ? (
    <StatusAction onClick={() => void completeBooking(booking.id)}>
      <Check className="w-4 h-4" /> Mark completed
    </StatusAction>
  ) : null;

  const icons = (
    <div className="flex flex-col md:flex-row items-center gap-1.5 shrink-0">
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
            {canStart ? (
              <button
                type="button"
                className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                onClick={() => {
                  setMenu(false);
                  void startBooking(booking.id);
                }}
              >
                Start detailing
              </button>
            ) : null}
            {ready ? (
              <button
                type="button"
                className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                onClick={() => {
                  setMenu(false);
                  openReadyModal(booking);
                }}
              >
                Ready for pickup
              </button>
            ) : null}
            {canComplete ? (
              <button
                type="button"
                className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                onClick={() => {
                  setMenu(false);
                  void completeBooking(booking.id);
                }}
              >
                Mark completed
              </button>
            ) : null}
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
            {(canAct || status === "in_progress" || status === "ready_for_pickup") && onCancel && (
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
  );

  const photo = photoIds[0] ? (
    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
      <AdminBookingPhoto
        token={token}
        bookingId={booking.id}
        photoId={photoIds[0]}
        className="w-full h-full"
      />
    </div>
  ) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200">
      <div className="md:hidden">
        <div className="flex items-start gap-3">
          <button type="button" onClick={onView} className="flex-1 min-w-0 text-left touch-manipulation">
            <div className="flex items-start gap-3">
              {photo}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white shrink-0">{time}</span>
                  <StatusBadge status={status} />
                </div>
                {showTimer ? (
                  <div className="mt-1">
                    <DetailTimer booking={booking} size="sm" />
                  </div>
                ) : null}
                <p className="mt-0.5 font-semibold text-white leading-snug">{booking.serviceName}</p>
                <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
                  {booking.customerName} · {booking.vehicle}
                </p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  {date} · {formatDuration(booking.serviceDurationMinutes)}
                </p>
                <CustomerPhotoBadge count={photoCount} />
                {preview ? <p className="mt-1 text-xs text-[#9CA3AF]/80 truncate">{preview}</p> : null}
              </div>
            </div>
          </button>
          {icons}
        </div>
        {primaryAction}
      </div>

      <div className="hidden md:flex md:items-center md:gap-3">
        <button type="button" onClick={onView} className="flex items-center gap-4 min-w-0 text-left">
          {photo}
          <div className="shrink-0">
            <p className="text-sm font-bold text-white tabular-nums leading-none">{time}</p>
            <div className="mt-1.5">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="min-w-0">
            {showTimer ? (
              <div className="mb-1">
                <DetailTimer booking={booking} size="sm" />
              </div>
            ) : null}
            <p className="font-semibold text-white leading-snug truncate">{booking.serviceName}</p>
            <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
              {booking.customerName} · {booking.vehicle}
            </p>
            <p className="mt-0.5 text-xs text-[#9CA3AF] truncate">
              {formatDateShort(date)} · {formatDuration(booking.serviceDurationMinutes)}
              {photoCount ? ` · ${photoCount} photo${photoCount === 1 ? "" : "s"}` : ""}
              {preview ? ` · ${preview}` : ""}
            </p>
          </div>
        </button>
        {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
        <div className="ml-auto shrink-0">{icons}</div>
      </div>
    </div>
  );
}

function StatusAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 w-full min-h-12 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#ff4adc] touch-manipulation md:mt-0 md:w-auto md:h-11 md:min-h-11 md:px-4 md:whitespace-nowrap"
    >
      {children}
    </button>
  );
}
