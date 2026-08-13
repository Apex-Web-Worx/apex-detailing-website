import { useEffect, useState } from "react";
import { formatDateTimeLong } from "@/lib/format";
import { useAdmin } from "../context";
import { displayStatus } from "../utils";
import { AdminCard, EmptyState, fieldClass, GhostButton, PrimaryButton } from "../components/ui";

type Template = {
  key: string;
  name: string;
  smsBody: string;
  emailSubject: string;
  emailBody: string;
};

type Communication = {
  id: number;
  bookingId: number;
  messageType: string;
  channel: string;
  status: string;
  error: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

export default function CommunicationsPage() {
  const { token, bookings, setDetail } = useAdmin();
  const [tab, setTab] = useState<"inbox" | "templates">("inbox");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reviewLink, setReviewLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const ready = bookings.filter((b) => displayStatus(b) === "ready_for_pickup" || b.readyAt);

  useEffect(() => {
    fetch("/api/admin/notification-templates", { headers: { "x-admin-token": token } })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setTemplates(Array.isArray(rows) ? rows : []))
      .catch(() => undefined);
    fetch("/api/admin/shop-settings", { headers: { "x-admin-token": token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((row) => {
        if (row?.reviewLink != null) setReviewLink(row.reviewLink);
      })
      .catch(() => undefined);
  }, [token]);

  const saveSettings = async () => {
    setSaving(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/shop-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ reviewLink }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNote("Review link saved.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async (tpl: Template) => {
    setSaving(true);
    setNote(null);
    try {
      const res = await fetch(`/api/admin/notification-templates/${tpl.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          smsBody: tpl.smsBody,
          emailSubject: tpl.emailSubject,
          emailBody: tpl.emailBody,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNote(`${tpl.name} saved.`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl md:text-2xl font-bold">Communications</h2>
      <div className="grid grid-cols-2 rounded-xl border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={`min-h-11 text-sm ${tab === "inbox" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
        >
          Inbox
        </button>
        <button
          type="button"
          onClick={() => setTab("templates")}
          className={`min-h-11 text-sm ${tab === "templates" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
        >
          Templates
        </button>
      </div>

      {tab === "inbox" && (
        <div className="space-y-3">
          {ready.length === 0 ? (
            <EmptyState title="No pickup notifications yet" body="Mark a vehicle ready for pickup to see it here." />
          ) : (
            ready.map((b) => (
              <CommCard key={b.id} bookingId={b.id} token={token} onOpen={() => setDetail(b)} />
            ))
          )}
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-4">
          <AdminCard hover={false} className="p-5 space-y-3">
            <h3 className="font-bold">Review link</h3>
            <p className="text-xs text-[#9CA3AF]">
              Paste your Google review URL from business settings. Leave blank to omit the link from review messages.
            </p>
            <input
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
              placeholder="https://…"
              className={fieldClass}
            />
            <PrimaryButton type="button" disabled={saving} onClick={saveSettings}>
              Save review link
            </PrimaryButton>
          </AdminCard>
          {templates.map((tpl) => (
            <AdminCard key={tpl.key} hover={false} className="p-5 space-y-3">
              <h3 className="font-bold">{tpl.name}</h3>
              <p className="text-xs text-[#9CA3AF]">
                Variables: {"{{customer_first_name}}"} {"{{vehicle}}"} {"{{service_name}}"} {"{{pickup_time}}"} {"{{review_link}}"}
              </p>
              <label className="block">
                <span className="text-xs text-[#9CA3AF]">SMS</span>
                <textarea
                  value={tpl.smsBody}
                  onChange={(e) =>
                    setTemplates((rows) =>
                      rows.map((r) => (r.key === tpl.key ? { ...r, smsBody: e.target.value } : r)),
                    )
                  }
                  rows={6}
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#9CA3AF]">Email subject</span>
                <input
                  value={tpl.emailSubject}
                  onChange={(e) =>
                    setTemplates((rows) =>
                      rows.map((r) => (r.key === tpl.key ? { ...r, emailSubject: e.target.value } : r)),
                    )
                  }
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#9CA3AF]">Email body</span>
                <textarea
                  value={tpl.emailBody}
                  onChange={(e) =>
                    setTemplates((rows) =>
                      rows.map((r) => (r.key === tpl.key ? { ...r, emailBody: e.target.value } : r)),
                    )
                  }
                  rows={8}
                  className={`${fieldClass} mt-1`}
                />
              </label>
              <GhostButton type="button" disabled={saving} onClick={() => saveTemplate(tpl)}>
                Save {tpl.name}
              </GhostButton>
            </AdminCard>
          ))}
          {note && <p className="text-sm text-emerald-300">{note}</p>}
        </div>
      )}
    </div>
  );
}

function CommCard({
  bookingId,
  token,
  onOpen,
}: {
  bookingId: number;
  token: string;
  onOpen: () => void;
}) {
  const { bookings } = useAdmin();
  const booking = bookings.find((b) => b.id === bookingId);
  const [rows, setRows] = useState<Communication[]>([]);

  useEffect(() => {
    fetch(`/api/admin/communications?bookingId=${bookingId}`, {
      headers: { "x-admin-token": token },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setRows(Array.isArray(list) ? list : []))
      .catch(() => undefined);
  }, [bookingId, token]);

  const ready = rows.filter((r) => r.messageType === "vehicle_ready");
  const review = rows.filter((r) => r.messageType === "review_request");
  const sms = ready.find((r) => r.channel === "sms");
  const email = ready.find((r) => r.channel === "email");
  const reviewRow = review[0];

  if (!booking) return null;

  return (
    <AdminCard hover={false} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{booking.customerName}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{booking.vehicle} · {booking.serviceName}</p>
        </div>
        <GhostButton type="button" className="h-9 text-xs" onClick={onOpen}>
          View
        </GhostButton>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Vehicle Ready</p>
          <p className="text-white mt-1">{statusLine("SMS", sms)}</p>
          <p className="text-white">{statusLine("Email", email)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Review Request</p>
          <p className="text-white mt-1">
            {reviewRow
              ? reviewRow.status === "scheduled" && reviewRow.scheduledAt
                ? `Scheduled for ${formatDateTimeLong(reviewRow.scheduledAt)}`
                : `${reviewRow.status}${reviewRow.error ? ` · ${reviewRow.error}` : ""}`
              : "Not scheduled"}
          </p>
        </div>
      </div>
    </AdminCard>
  );
}

function statusLine(label: string, row?: Communication) {
  if (!row) return `${label} not sent`;
  if (row.status === "sent" || row.status === "delivered") return `✓ ${label} ${row.status}`;
  if (row.status === "failed") return `${label} failed${row.error ? ` · ${row.error}` : ""}`;
  return `${label} ${row.status}`;
}
