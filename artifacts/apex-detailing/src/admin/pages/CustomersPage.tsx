import { useMemo, useState } from "react";
import { Link } from "wouter";
import VehiclePhoto from "@/components/VehiclePhoto";
import { useAdmin } from "../context";
import { bookingIso, customerKey, displayStatus, groupCustomers } from "../utils";
import { AdminCard, EmptyState, fieldClass, StatusBadge } from "../components/ui";

export default function CustomersPage() {
  const { bookings, routeId, section } = useAdmin();
  const customers = useMemo(() => groupCustomers(bookings), [bookings]);
  const [q, setQ] = useState("");
  const selected = section === "customers" && routeId
    ? customers.find((c) => c.key === customerKey(routeId))
    : null;

  if (selected) {
    const notes = selected.bookings.map((b) => b.notes?.trim()).filter(Boolean);
    return (
      <div className="space-y-4">
        <Link href="/admin/customers" className="text-sm text-[#9CA3AF] hover:text-white">← Customers</Link>
        <h2 className="text-2xl font-bold">{selected.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard hover={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Customer information</h3>
            <p className="text-white">{selected.name}</p>
            <p className="text-sm text-[#9CA3AF] mt-1">{selected.phone}</p>
            <p className="text-sm text-[#9CA3AF]">{selected.email}</p>
          </AdminCard>
          <AdminCard hover={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Vehicles</h3>
            {selected.vehicles.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">None on file.</p>
            ) : (
              selected.vehicles.map((v) => (
                <Link
                  key={v}
                  href={`/admin/vehicles/${encodeURIComponent(`${selected.key}||${v.toLowerCase()}`)}`}
                  className="flex items-center gap-3 text-sm text-white hover:text-[#23B9FF] py-1.5"
                >
                  <VehiclePhoto vehicle={v} size="sm" />
                  <span>{v}</span>
                </Link>
              ))
            )}
          </AdminCard>
        </div>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Appointment history</h3>
          <div className="space-y-3">
            {selected.bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm text-white">{b.serviceName}</p>
                  <p className="text-xs text-[#9CA3AF]">{new Date(bookingIso(b)).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={displayStatus(b)} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Notes</h3>
          {notes.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No notes on this customer's bookings.</p>
          ) : (
            notes.map((n, i) => (
              <p key={i} className="text-sm text-white whitespace-pre-wrap mb-3">{n}</p>
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
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" className={`max-w-md ${fieldClass}`} />
      {filtered.length === 0 ? (
        <EmptyState title="No customers" body="Customers appear here from booking records." />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link key={c.key} href={`/admin/customers/${encodeURIComponent(c.key)}`}>
              <AdminCard className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-sm text-[#9CA3AF] truncate">{c.phone} · {c.email}</p>
                  </div>
                  <p className="text-sm text-[#9CA3AF]">{c.vehicles.length} vehicle{c.vehicles.length === 1 ? "" : "s"}</p>
                  <p className="text-sm text-[#9CA3AF]">{c.appointmentCount} appt{c.appointmentCount === 1 ? "" : "s"}</p>
                </div>
              </AdminCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
