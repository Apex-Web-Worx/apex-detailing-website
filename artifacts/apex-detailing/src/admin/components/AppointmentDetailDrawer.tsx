import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Mail, MessageSquare, Phone, X, Check, Play } from "lucide-react";
import { formatDateTimeLong, formatDuration } from "@/lib/format";
import { useAdmin } from "../context";
import {
  bookingIso,
  bookingStoredDetailMs,
  canMarkCompleted,
  canMarkReady,
  canStartJob,
  displayStatus,
  formatElapsedLong,
} from "../utils";
import { GhostButton, PrimaryButton, StatusBadge } from "./ui";
import DetailTimer from "./DetailTimer";
import {
  CustomerPhotoGallery,
  photoIdsForBooking,
  useAdminBookingPhotoIndex,
} from "./CustomerPhotos";

type TimelineEvent = {
  id: number;
  occurredAt: string;
  actor: string;
  action: string;
  channel: string | null;
  status: string | null;
  detail: string;
};

type Communication = {
  id: number;
  messageType: string;
  channel: string;
  status: string;
  error: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

export default function AppointmentDetailDrawer() {
  const {
    detail,
    setDetail,
    setEditing,
    cancelBooking,
    token,
    refetch,
    openReadyModal,
    startBooking,
  } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = detail ? photoIdsForBooking(photosQuery.data, detail.id) : [];
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [comms, setComms] = useState<Communication[]>([]);
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    if (!detail) return;
    let cancelled = false;
    fetch(`/api/admin/bookings/${detail.id}/timeline`, {
      headers: { "x-admin-token": token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        setEvents(json.events ?? []);
        setComms(json.communications ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [detail, token]);

  if (!detail) return null;
  const status = displayStatus(detail);
  const canAct = status === "confirmed";
  const ready = canMarkReady(detail);
  const complete = canMarkCompleted(detail);
  const canStart = canStartJob(detail);
  const alreadyReady = status === "ready_for_pickup" || status === "completed";
  const storedDetailMs = bookingStoredDetailMs(detail);
  const smsHref = `sms:${detail.phone}`;
  const pickupNote = comms.find((c) => c.messageType === "vehicle_ready" && (c.status === "sent" || c.status === "delivered"));
  const reviewSched = comms.find((c) => c.messageType === "review_request" && c.status === "scheduled");
  const reviewFailed = comms.find((c) => c.messageType === "review_request" && c.status === "failed");

  const markInProgress = async () => {
    setBusy(true);
    try {
      await startBooking(detail.id);
    } finally {
      setBusy(false);
    }
  };

  const markComplete = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${detail.id}/complete`, {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setDetail(json);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not complete");
    } finally {
      setBusy(false);
    }
  };

  const retryReview = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${detail.id}/review-request/retry`, {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error(await res.text());
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setBusy(false);
    }
  };

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
                <dt className="text-[#9CA3AF] text-xs">Booked</dt>
                <dd className="text-white mt-0.5">{formatDuration(detail.serviceDurationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-[#9CA3AF] text-xs">Status</dt>
                <dd className="mt-1"><StatusBadge status={status} /></dd>
              </div>
              {storedDetailMs != null ? (
                <div className="col-span-2">
                  <dt className="text-[#9CA3AF] text-xs">Time on this car</dt>
                  <dd className="text-white mt-0.5">{formatElapsedLong(storedDetailMs)}</dd>
                </div>
              ) : null}
            </dl>
            {(status === "in_progress" || alreadyReady) &&
            (detail.inProgressAt || detail.detailDurationMinutes != null) ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4">
                <DetailTimer booking={detail} size="lg" />
              </div>
            ) : null}
          </section>

          {alreadyReady && (
            <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <p className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" /> Ready for pickup
              </p>
              {pickupNote && (
                <p className="text-xs text-[#9CA3AF]">
                  Pickup notification sent
                  {pickupNote.sentAt ? ` · ${formatDateTimeLong(pickupNote.sentAt)}` : ""}
                </p>
              )}
              {reviewSched && (
                <p className="text-xs text-[#9CA3AF]">
                  Review request scheduled
                  {reviewSched.scheduledAt ? ` · ${formatDateTimeLong(reviewSched.scheduledAt)}` : ""}
                </p>
              )}
              {reviewFailed && (
                <div className="text-xs text-red-300">
                  Review request failed{reviewFailed.error ? ` · ${reviewFailed.error}` : ""}
                  <button
                    type="button"
                    className="ml-2 text-[#23B9FF]"
                    onClick={retryReview}
                    disabled={busy}
                  >
                    Retry
                  </button>
                </div>
              )}
              <GhostButton type="button" className="h-10 text-xs" onClick={() => openReadyModal(detail, true)}>
                Resend notification
              </GhostButton>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Timeline</h3>
            {events.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">No workflow events yet.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="border-l border-white/10 pl-3">
                    <p className="text-xs text-[#9CA3AF]">{formatDateTimeLong(ev.occurredAt)}</p>
                    <p className="text-sm text-white">{ev.detail || ev.action.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-[#9CA3AF]">
                      {ev.actor}
                      {ev.channel ? ` · ${ev.channel}` : ""}
                      {ev.status ? ` · ${ev.status}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer notes</h3>
            <p className="text-sm text-white whitespace-pre-wrap">
              {detail.notes?.trim() ? detail.notes : "No notes on this booking."}
            </p>
          </section>
        </div>

        <div className="shrink-0 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#0B0B0B] space-y-2">
          {canStart && (
            <PrimaryButton type="button" className="w-full min-h-12" disabled={busy} onClick={markInProgress}>
              <Play className="w-4 h-4" /> Start
            </PrimaryButton>
          )}
          {ready && (
            <PrimaryButton
              type="button"
              className="w-full min-h-12"
              disabled={busy}
              onClick={() => openReadyModal(detail)}
            >
              <Check className="w-4 h-4" /> Ready for pickup
            </PrimaryButton>
          )}
          {complete && (
            <PrimaryButton type="button" className="w-full min-h-12" disabled={busy} onClick={markComplete}>
              Mark completed
            </PrimaryButton>
          )}
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
          {(status === "in_progress" || status === "ready_for_pickup") && (
            <GhostButton
              type="button"
              className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10"
              onClick={() => cancelBooking(detail.id)}
            >
              Cancel appointment
            </GhostButton>
          )}
        </div>
      </aside>
    </div>
  );
}
