import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdmin } from "../context";
import {
  bookingIso,
  bookingStoredDetailMs,
  customerKey,
  displayStatus,
  formatElapsedLong,
  groupCustomers,
} from "../utils";
import { AdminCard, EmptyState, fieldClass, GhostButton, StatusBadge } from "../components/ui";
import { formatDateTimeLong } from "@/lib/format";

export default function CustomersPage() {
  const { bookings, routeId, section, token, refetch } = useAdmin();
  const [, setLocation] = useLocation();
  const customers = useMemo(() => groupCustomers(bookings), [bookings]);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState(false);
  const selected =
    section === "customers" && routeId
      ? customers.find((c) => c.key === customerKey(routeId))
      : null;

  const deleteClient = async () => {
    if (!selected) return;
    if (
      !confirm(
        `Delete ${selected.name} and all their appointments permanently?\n\nNo messages will be sent to the customer.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/customers?email=${encodeURIComponent(selected.key)}`,
        {
          method: "DELETE",
          headers: { "x-admin-token": token },
        },
      );
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(json?.message ?? `Delete failed (${res.status})`);
      }
      await refetch();
      setLocation("/admin/customers");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not delete client");
    } finally {
      setDeleting(false);
    }
  };

  if (selected) {
    const notes = selected.bookings.map((b) => b.notes?.trim()).filter(Boolean);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/customers"
            className="inline-flex items-center min-h-11 text-sm text-[#9CA3AF] hover:text-white touch-manipulation"
          >
            ← Customers
          </Link>
          <GhostButton
            type="button"
            className="min-h-11 h-11 text-red-400 border-red-500/30 hover:bg-red-500/10"
            disabled={deleting}
            onClick={() => void deleteClient()}
          >
            {deleting ? "Deleting…" : "Delete client"}
          </GhostButton>
        </div>
        <h2 className="text-2xl font-bold">{selected.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard hover={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
              Customer information
            </h3>
            <p className="text-white">{selected.name}</p>
            <p className="text-sm text-[#9CA3AF] mt-1">{selected.phone}</p>
            <p className="text-sm text-[#9CA3AF]">{selected.email}</p>
          </AdminCard>
          <AdminCard hover={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
              Vehicles
            </h3>
            {selected.vehicles.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">None on file.</p>
            ) : (
              selected.vehicles.map((v) => (
                <p key={v} className="text-sm text-white py-1">
                  {v}
                </p>
              ))
            )}
          </AdminCard>
        </div>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Appointment history
          </h3>
          <div className="space-y-3">
            {selected.bookings.map((b) => {
              const took = bookingStoredDetailMs(b);
              return (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3"
                >
                  <div>
                    <p className="text-sm text-white">{b.serviceName}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {b.vehicle ? `${b.vehicle} · ` : ""}
                      {new Date(bookingIso(b)).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {took != null ? (
                      <span className="text-xs font-semibold tabular-nums text-[#23B9FF]">
                        {formatElapsedLong(took)}
                      </span>
                    ) : null}
                    <StatusBadge status={displayStatus(b)} />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Communications
          </h3>
          <CustomerComms email={selected.email} token={token} />
        </AdminCard>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Notes</h3>
          {notes.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No notes on this customer's bookings.</p>
          ) : (
            notes.map((n, i) => (
              <p key={i} className="text-sm text-white whitespace-pre-wrap mb-3">
                {n}
              </p>
            ))
          )}
        </AdminCard>
      </div>
    );
  }

  const filtered = customers.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Customers</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search customers"
        className={`max-w-md ${fieldClass}`}
      />
      {filtered.length === 0 ? (
        <EmptyState title="No customers" body="Customers appear here from booking records." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <Link key={c.key} href={`/admin/customers/${encodeURIComponent(c.key)}`}>
              <AdminCard className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-sm text-[#9CA3AF] truncate">
                      {c.phone} · {c.email}
                    </p>
                  </div>
                  <p className="text-sm text-[#9CA3AF]">
                    {c.vehicles.length} vehicle{c.vehicles.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-sm text-[#9CA3AF]">
                    {c.appointmentCount} appt{c.appointmentCount === 1 ? "" : "s"}
                  </p>
                </div>
              </AdminCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerComms({ email, token }: { email: string; token: string }) {
  const [rows, setRows] = useState<
    Array<{
      id: number;
      messageType: string;
      channel: string;
      status: string;
      error: string | null;
      scheduledAt: string | null;
      sentAt: string | null;
      createdAt: string;
    }>
  >([]);

  useEffect(() => {
    fetch(`/api/admin/communications?email=${encodeURIComponent(email)}`, {
      headers: { "x-admin-token": token },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setRows(Array.isArray(list) ? list : []))
      .catch(() => undefined);
  }, [email, token]);

  if (rows.length === 0) {
    return <p className="text-sm text-[#9CA3AF]">No pickup or review messages yet.</p>;
  }

  const last = rows[0];
  return (
    <div className="space-y-2">
      <p className="text-sm text-white">
        Last communication: {last.messageType.replace(/_/g, " ")} · {last.channel} · {last.status}
        {last.sentAt
          ? ` · ${formatDateTimeLong(last.sentAt)}`
          : last.scheduledAt
            ? ` · ${formatDateTimeLong(last.scheduledAt)}`
            : ""}
      </p>
      {rows.slice(0, 8).map((row) => (
        <p key={row.id} className="text-xs text-[#9CA3AF]">
          {row.messageType.replace(/_/g, " ")} · {row.channel} · {row.status}
          {row.error ? ` · ${row.error}` : ""}
        </p>
      ))}
    </div>
  );
}
