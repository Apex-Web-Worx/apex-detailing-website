import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import { formatDateTimeLong } from "@/lib/format";
import { useAdmin } from "../context";
import { type DisplayStatus } from "../utils";
import { AdminCard, EmptyState, GhostButton, PrimaryButton, StatusBadge } from "../components/ui";

type ReviewStatus = "none" | "scheduled" | "sent" | "failed" | "skipped";

type ReviewItem = {
  bookingId: number;
  customerName: string;
  phone: string;
  email: string;
  vehicle: string;
  serviceName: string;
  status: string;
  scheduledAt: string;
  readyAt: string | null;
  completedAt: string | null;
  reviewStatus: ReviewStatus;
  reviewChannel: string | null;
  reviewScheduledAt: string | null;
  reviewSentAt: string | null;
  reviewError: string | null;
};

type Filter = "action" | "sent" | "skipped" | "all";

function jobStatus(item: ReviewItem): DisplayStatus {
  const status = item.status;
  if (
    status === "cancelled" ||
    status === "completed" ||
    status === "ready_for_pickup" ||
    status === "in_progress"
  ) {
    return status;
  }
  return "confirmed";
}

function reviewLabel(item: ReviewItem): string {
  if (item.reviewStatus === "skipped") return "Will not send";
  if (item.reviewStatus === "sent") {
    return item.reviewSentAt ? `Sent · ${formatDateTimeLong(item.reviewSentAt)}` : "Sent";
  }
  if (item.reviewStatus === "failed") {
    return item.reviewError ? `Failed · ${item.reviewError}` : "Failed";
  }
  return "Not sent yet";
}

export default function ReviewsPage() {
  const {
    token,
    bookings,
    setDetail,
    sendReviewRequest,
    skipReviewRequest,
    unskipReviewRequest,
  } = useAdmin();
  const [reviewLink, setReviewLink] = useState("");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("action");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/review-requests", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error(`Could not load reviews (${res.status})`);
      const json = (await res.json()) as { reviewLink?: string; items?: ReviewItem[] };
      setReviewLink(typeof json.reviewLink === "string" ? json.reviewLink : "");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not load reviews");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const action = items.filter(
      (item) => item.reviewStatus === "none" || item.reviewStatus === "failed",
    ).length;
    return {
      action,
      sent: items.filter((item) => item.reviewStatus === "sent").length,
      skipped: items.filter((item) => item.reviewStatus === "skipped").length,
      all: items.length,
    };
  }, [items]);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "action") {
      return items.filter(
        (item) => item.reviewStatus === "none" || item.reviewStatus === "failed",
      );
    }
    return items.filter((item) => item.reviewStatus === filter);
  }, [filter, items]);

  const run = async (id: number, work: () => Promise<string>) => {
    setBusyId(id);
    setNote(null);
    try {
      const message = await work();
      setNote(message);
      await load();
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const retry = async (id: number) => {
    const res = await fetch(`/api/admin/bookings/${id}/review-request/retry`, {
      method: "POST",
      headers: { "x-admin-token": token },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(
        json && typeof json === "object" && "message" in json && typeof json.message === "string"
          ? json.message
          : "Retry failed",
      );
    }
  };

  const openAppointment = (bookingId: number) => {
    const booking = bookings.find((row) => row.id === bookingId);
    if (booking) setDetail(booking);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FF2AD4]" /> Reviews
          </h2>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Send the Google review link yourself. Nothing is sent until you tap Send.
          </p>
        </div>
        <GhostButton type="button" onClick={() => void load()} disabled={loading} className="px-3">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </GhostButton>
      </div>

      <AdminCard hover={false} className="p-4 md:p-5 space-y-2">
        <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Google review link</p>
        {reviewLink ? (
          <a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#23B9FF] break-all hover:underline"
          >
            {reviewLink}
          </a>
        ) : (
          <p className="text-sm text-[#9CA3AF]">No review URL saved yet.</p>
        )}
      </AdminCard>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["action", `Needs send (${counts.action})`],
            ["sent", `Sent (${counts.sent})`],
            ["skipped", `Skipped (${counts.skipped})`],
            ["all", `All (${counts.all})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`min-h-11 px-3 rounded-xl border text-xs font-semibold touch-manipulation ${
              filter === key
                ? "border-[#FF2AD4]/40 bg-[#FF2AD4]/15 text-white"
                : "border-white/10 text-[#9CA3AF] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {note ? <p className="text-sm text-[#23B9FF]">{note}</p> : null}

      {loading && items.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">Loading review requests…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          title={filter === "action" ? "Nothing waiting to send" : "No reviews in this list"}
          body="Jobs show here after you start detailing. Send the Google review from this page or the dashboard when you want. Nothing is sent automatically."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {visible.map((item) => {
            const busy = busyId === item.bookingId;
            return (
              <AdminCard key={item.bookingId} hover={false} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{item.customerName}</p>
                    <p className="text-xs text-[#9CA3AF] mt-1 truncate">
                      {item.vehicle} · {item.serviceName}
                    </p>
                  </div>
                  <StatusBadge status={jobStatus(item)} />
                </div>
                <p
                  className={`text-sm ${
                    item.reviewStatus === "failed"
                      ? "text-red-300"
                      : item.reviewStatus === "skipped"
                        ? "text-amber-300"
                        : item.reviewStatus === "sent"
                          ? "text-emerald-300"
                          : "text-[#9CA3AF]"
                  }`}
                >
                  {reviewLabel(item)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.reviewStatus !== "sent" && item.reviewStatus !== "skipped" ? (
                    <PrimaryButton
                      type="button"
                      className="h-10 text-xs px-3"
                      disabled={busy}
                      onClick={() =>
                        void run(item.bookingId, async () => {
                          const result = await sendReviewRequest(item.bookingId);
                          return result === "already"
                            ? "Review link already sent."
                            : "Review link sent.";
                        })
                      }
                    >
                      Send review link
                    </PrimaryButton>
                  ) : null}
                  {item.reviewStatus === "failed" ? (
                    <GhostButton
                      type="button"
                      className="h-10 text-xs px-3"
                      disabled={busy}
                      onClick={() =>
                        void run(item.bookingId, async () => {
                          await retry(item.bookingId);
                          return "Retry sent.";
                        })
                      }
                    >
                      Retry
                    </GhostButton>
                  ) : null}
                  {item.reviewStatus === "skipped" ? (
                    <GhostButton
                      type="button"
                      className="h-10 text-xs px-3"
                      disabled={busy}
                      onClick={() =>
                        void run(item.bookingId, async () => {
                          await unskipReviewRequest(item.bookingId);
                          return "Review is allowed again for this client.";
                        })
                      }
                    >
                      Allow review
                    </GhostButton>
                  ) : item.reviewStatus !== "sent" ? (
                    <GhostButton
                      type="button"
                      className="h-10 text-xs px-3"
                      disabled={busy}
                      onClick={() =>
                        void run(item.bookingId, async () => {
                          await skipReviewRequest(item.bookingId);
                          return "Review will not be sent to this client.";
                        })
                      }
                    >
                      Don’t send to this client
                    </GhostButton>
                  ) : null}
                  <GhostButton
                    type="button"
                    className="h-10 text-xs px-3"
                    onClick={() => openAppointment(item.bookingId)}
                  >
                    View appointment
                  </GhostButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
