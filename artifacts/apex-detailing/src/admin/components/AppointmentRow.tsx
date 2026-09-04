import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import type { Booking } from "@workspace/api-client-react";
import { MoreHorizontal, Phone, Check, Play, Square } from "lucide-react";
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
import {
  AdminBookingPhoto,
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
  const {
    token,
    openReadyModal,
    startBooking,
    stopTimer,
    completeBooking,
    sendReviewRequest,
    skipReviewRequest,
    unskipReviewRequest,
  } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = photoIdsForBooking(photosQuery.data, booking.id);
  const photoCount = photoIds.length;
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = displayStatus(booking);
  const preview = notesPreview(booking.notes);
  const canAct = status === "confirmed";
  const ready = canMarkReady(booking);
  const canStart = canStartJob(booking);
  const canComplete = canMarkCompleted(booking);
  const canStop = status === "in_progress";
  const date = bookingShopDate(booking);
  const time = formatTime12h(bookingShopTime(booking));

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const primaryAction = canStart ? (
    <StatusAction onClick={() => void startBooking(booking.id)}>
      <Play className="w-3.5 h-3.5" /> Start detailing
    </StatusAction>
  ) : ready ? (
    <StatusAction onClick={() => openReadyModal(booking)}>
      <Check className="w-3.5 h-3.5" /> Ready for pickup
    </StatusAction>
  ) : canComplete ? (
    <StatusAction onClick={() => void completeBooking(booking.id)}>
      <Check className="w-3.5 h-3.5" /> Mark completed
    </StatusAction>
  ) : null;

  const stopAction = canStop ? (
    <button
      type="button"
      onClick={() => void stopTimer(booking.id)}
      className="min-h-11 h-11 px-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-white/10 touch-manipulation whitespace-nowrap flex-1 md:flex-none"
    >
      <Square className="w-3.5 h-3.5" /> Stop timer
    </button>
  ) : null;

  const menuPanel = menu ? (
    <div className="absolute right-0 top-full mt-1 w-56 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-white/10 bg-[#0B0B0B] py-1 z-50 shadow-xl">
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
      {canStop ? (
        <button
          type="button"
          className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
          onClick={() => {
            setMenu(false);
            void stopTimer(booking.id);
          }}
        >
          Stop timer
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
      {status === "in_progress" || status === "ready_for_pickup" || status === "completed" ? (
        <button
          type="button"
          className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
          onClick={() => {
            setMenu(false);
            void sendReviewRequest(booking.id)
              .then((result) => {
                alert(
                  result === "already"
                    ? "Review link already sent. It will not send again."
                    : "Review link sent.",
                );
              })
              .catch((e) => {
                alert(e instanceof Error ? e.message : "Could not send review link");
              });
          }}
        >
          Send review link
        </button>
      ) : null}
      {status !== "cancelled" ? (
        <>
          <button
            type="button"
            className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
            onClick={() => {
              setMenu(false);
              void skipReviewRequest(booking.id)
                .then((result) => {
                  alert(
                    result === "already"
                      ? "Review is already skipped for this client."
                      : "Review will not be sent to this client.",
                  );
                })
                .catch((e) => {
                  alert(e instanceof Error ? e.message : "Could not skip review");
                });
            }}
          >
            Don’t send review to this client
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
            onClick={() => {
              setMenu(false);
              void unskipReviewRequest(booking.id)
                .then(() => {
                  alert("Review is allowed again for this client.");
                })
                .catch((e) => {
                  alert(e instanceof Error ? e.message : "Could not allow review");
                });
            }}
          >
            Allow review for this client
          </button>
        </>
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
  ) : null;

  const actions = (
    <div className="flex w-full md:w-auto flex-row items-center gap-1.5 shrink-0">
      {primaryAction}
      {stopAction}
      <a
        href={`tel:${booking.phone}`}
        className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#23B9FF] hover:bg-white/5 touch-manipulation shrink-0"
        aria-label={`Call ${booking.customerName}`}
      >
        <Phone className="w-4 h-4" />
      </a>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 touch-manipulation"
          aria-label="More actions"
          aria-expanded={menu}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuPanel}
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
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200 overflow-visible">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <button
          type="button"
          onClick={onView}
          className="flex items-start md:items-center gap-3 min-w-0 flex-1 text-left touch-manipulation"
        >
          {photo}
          <div className="shrink-0">
            <p className="text-sm font-bold text-white tabular-nums leading-none">{time}</p>
            <div className="mt-1.5 hidden md:block">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 md:hidden">
              <StatusBadge status={status} />
            </div>
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
        {actions}
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
      className="min-h-11 h-11 px-3 rounded-xl bg-[#FF2AD4] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#ff4adc] touch-manipulation whitespace-nowrap flex-1 md:flex-none"
    >
      {children}
    </button>
  );
}
