import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Mail, MessageSquare, Phone, X, Check, Play, Square, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
  direction?: string;
  body?: string;
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
    stopTimer,
    resetToStart,
    completeBooking,
    sendReviewRequest,
    skipReviewRequest,
    unskipReviewRequest,
  } = useAdmin();
  const photosQuery = useAdminBookingPhotoIndex(token);
  const photoIds = detail ? photoIdsForBooking(photosQuery.data, detail.id) : [];
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [comms, setComms] = useState<Communication[]>([]);
  const [busy, setBusy] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);

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
  const inboundReplies = comms.filter(
    (c) => c.messageType === "customer_reply" || c.direction === "inbound",
  );
  const pickupNote = comms.find((c) => c.messageType === "vehicle_ready" && (c.status === "sent" || c.status === "delivered"));
  const reviewFailed = comms.find((c) => c.messageType === "review_request" && c.status === "failed");
  const reviewSkipped = comms.find((c) => c.messageType === "review_request" && c.status === "skipped");
  const reviewSent = comms.find(
    (c) =>
      c.messageType === "review_request" &&
      (c.status === "sent" || c.status === "delivered" || c.status === "pending"),
  );

  const reloadTimeline = async () => {
    const res = await fetch(`/api/admin/bookings/${detail.id}/timeline`, {
      headers: { "x-admin-token": token },
    });
    if (res.ok) {
      const json = await res.json();
      setEvents(json.events ?? []);
      setComms(json.communications ?? []);
    }
  };

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
      await completeBooking(detail.id);
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

  const sendReview = async () => {
    if (reviewSkipped) {
      setReviewNote("Review is skipped for this client. Allow the review first if you want to send it.");
      return;
    }
    if (reviewSent) {
      setReviewNote("Review link already sent. It will not send again.");
      return;
    }
    setBusy(true);
    setReviewNote(null);
    try {
      const result = await sendReviewRequest(detail.id);
      setReviewNote(result === "already" ? "Review link already sent. It will not send again." : "Review link sent.");
      await reloadTimeline();
    } catch (e) {
      setReviewNote(e instanceof Error ? e.message : "Could not send review link");
    } finally {
      setBusy(false);
    }
  };

  const skipReview = async () => {
    setBusy(true);
    setReviewNote(null);
    try {
      await skipReviewRequest(detail.id);
      setReviewNote("Review will not be sent to this client.");
      await reloadTimeline();
    } catch (e) {
      setReviewNote(e instanceof Error ? e.message : "Could not skip review");
    } finally {
      setBusy(false);
    }
  };

  const allowReview = async () => {
    setBusy(true);
    setReviewNote(null);
    try {
      await unskipReviewRequest(detail.id);
      setReviewNote("Review is allowed again. Send it from the dashboard when you want.");
      await reloadTimeline();
    } catch (e) {
      setReviewNote(e instanceof Error ? e.message : "Could not allow review");
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

          {status !== "cancelled" ? (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
                Change status
              </h3>
              <ol className="space-y-2 text-sm">
                <StatusStep
                  n={1}
                  label="Confirmed"
                  hint="Starts automatically at the scheduled time if you forget — or tap Start when you begin."
                  current={status === "confirmed"}
                  done={status === "in_progress" || status === "ready_for_pickup" || status === "completed"}
                />
                <StatusStep
                  n={2}
                  label="In progress"
                  hint="Timer runs until Ready for pickup."
                  current={status === "in_progress"}
                  done={status === "ready_for_pickup" || status === "completed"}
                />
                <StatusStep
                  n={3}
                  label="Ready for pickup"
                  hint="Saves time for this car and notifies the customer."
                  current={status === "ready_for_pickup"}
                  done={status === "completed"}
                />
                <StatusStep
                  n={4}
                  label="Completed"
                  hint="Tap Mark completed after they pick up."
                  current={status === "completed"}
                  done={false}
                />
              </ol>
              {status !== "confirmed" ? (
                <GhostButton
                  type="button"
                  className="mt-3 w-full h-11 text-xs"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      !confirm(
                        "Reset this appointment to Confirmed / Start? This clears the timer and pickup status. No messages will be sent to the customer.",
                      )
                    ) {
                      return;
                    }
                    setBusy(true);
                    try {
                      await resetToStart(detail.id);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Reset to Start (clear timer, no messages)
                </GhostButton>
              ) : null}
            </section>
          ) : null}

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
              {reviewSkipped && (
                <p className="text-xs text-[#9CA3AF]">Review will not be sent to this client</p>
              )}
              {reviewSent && (
                <p className="text-xs text-[#9CA3AF]">
                  Review request sent
                  {reviewSent.sentAt ? ` · ${formatDateTimeLong(reviewSent.sentAt)}` : ""}
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

          {status !== "cancelled" ? (
            <section className="rounded-xl border border-white/10 bg-[#111111] p-4 space-y-2">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FF2AD4]" /> Review link
              </p>
              <p className="text-xs text-[#9CA3AF]">
                Reviews are not sent automatically. Send the Google review link from here or the dashboard when you want. You can also skip this client.
              </p>
              {reviewSkipped ? (
                <p className="text-xs text-amber-300">Will not send to this client</p>
              ) : reviewSent ? (
                <p className="text-xs text-emerald-300">
                  Sent{reviewSent.sentAt ? ` · ${formatDateTimeLong(reviewSent.sentAt)}` : ""}
                </p>
              ) : (
                <p className="text-xs text-[#9CA3AF]">Not sent yet</p>
              )}
              {reviewNote ? <p className="text-xs text-[#23B9FF]">{reviewNote}</p> : null}
              {status !== "confirmed" && !reviewSkipped ? (
                <GhostButton
                  type="button"
                  className="h-10 text-xs w-full"
                  disabled={busy || Boolean(reviewSent)}
                  onClick={() => void sendReview()}
                >
                  {reviewSent ? "Review link sent" : "Send review link"}
                </GhostButton>
              ) : null}
              {reviewSkipped ? (
                <GhostButton
                  type="button"
                  className="h-10 text-xs w-full"
                  disabled={busy}
                  onClick={() => void allowReview()}
                >
                  Allow review for this client
                </GhostButton>
              ) : !reviewSent ? (
                <GhostButton
                  type="button"
                  className="h-10 text-xs w-full"
                  disabled={busy}
                  onClick={() => void skipReview()}
                >
                  Don’t send review to this client
                </GhostButton>
              ) : null}
            </section>
          ) : null}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer SMS replies</h3>
            {inboundReplies.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">No replies from this customer yet.</p>
            ) : (
              <ul className="space-y-3">
                {inboundReplies.map((row) => (
                  <li key={row.id} className="border-l border-orange-500/40 pl-3">
                    <p className="text-xs text-[#9CA3AF]">
                      {formatDateTimeLong(row.sentAt ?? row.createdAt)}
                    </p>
                    <p className="text-sm text-white whitespace-pre-wrap">{row.body?.trim() || "(empty)"}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
              <Play className="w-4 h-4" /> Start detailing
            </PrimaryButton>
          )}
          {status === "in_progress" && (
            <GhostButton
              type="button"
              className="w-full min-h-12"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await stopTimer(detail.id);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Square className="w-4 h-4" /> Stop timer
            </GhostButton>
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

function StatusStep({
  n,
  label,
  hint,
  current,
  done,
}: {
  n: number;
  label: string;
  hint: string;
  current: boolean;
  done: boolean;
}) {
  return (
    <li className={cn("rounded-xl border px-3 py-2.5", current ? "border-[#FF2AD4]/40 bg-[#FF2AD4]/10" : "border-white/10")}>
      <p className={cn("text-sm font-semibold", current || done ? "text-white" : "text-[#9CA3AF]")}>
        {n}. {label}
        {current ? " · now" : done ? " · done" : ""}
      </p>
      <p className="text-xs text-[#9CA3AF] mt-0.5">{hint}</p>
    </li>
  );
}
