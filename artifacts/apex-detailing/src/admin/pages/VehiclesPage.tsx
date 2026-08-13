import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAdmin } from "../context";
import {
  bookingIso,
  bookingStoredDetailMs,
  displayStatus,
  formatElapsedLong,
  groupVehicles,
} from "../utils";
import { AdminCard, EmptyState, fieldClass, StatusBadge } from "../components/ui";

export default function VehiclesPage() {
  const { bookings, routeId, section } = useAdmin();
  const vehicles = useMemo(() => groupVehicles(bookings), [bookings]);
  const [q, setQ] = useState("");
  const selected = section === "vehicles" && routeId
    ? vehicles.find((v) => v.key === routeId)
    : null;

  if (selected) {
    return (
      <div className="space-y-4">
        <Link href="/admin/vehicles" className="text-sm text-[#9CA3AF] hover:text-white">← Vehicles</Link>
        <h2 className="text-2xl font-bold">{selected.vehicle}</h2>
        <AdminCard hover={false} className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Owner</p>
          <Link href={`/admin/customers/${encodeURIComponent(selected.ownerEmail.toLowerCase())}`} className="text-white hover:text-[#23B9FF]">
            {selected.ownerName}
          </Link>
          <p className="text-sm text-[#9CA3AF] mt-1">{selected.ownerPhone}</p>
        </AdminCard>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Detailing time for this car
          </h3>
          {selected.timedVisitCount === 0 ? (
            <p className="text-sm text-[#9CA3AF]">
              Time is saved when you tap Ready for Pickup after starting the job.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#9CA3AF]">Last visit</p>
                <p className="text-xl font-bold text-white mt-1">
                  {selected.lastDetailMs != null ? formatElapsedLong(selected.lastDetailMs) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">
                  Average{selected.timedVisitCount > 1 ? ` · ${selected.timedVisitCount} visits` : ""}
                </p>
                <p className="text-xl font-bold text-white mt-1">
                  {selected.averageDetailMs != null ? formatElapsedLong(selected.averageDetailMs) : "—"}
                </p>
              </div>
            </div>
          )}
        </AdminCard>
        <AdminCard hover={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Service history</h3>
          {selected.bookings.map((b) => {
            const took = bookingStoredDetailMs(b);
            return (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-3">
                <div>
                  <p className="text-sm text-white">{b.serviceName}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {new Date(bookingIso(b)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "America/Chicago" })}
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
          <p className="text-xs text-[#9CA3AF] mt-4">
            Last ceramic coating, paint correction, and recommended next service will appear when those fields exist in the database.
          </p>
        </AdminCard>
      </div>
    );
  }

  const filtered = vehicles.filter((v) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return v.vehicle.toLowerCase().includes(s) || v.ownerName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Vehicles</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vehicles" className={`max-w-md ${fieldClass}`} />
      {filtered.length === 0 ? (
        <EmptyState title="No vehicles" body="Vehicles are collected from the vehicle field on bookings." />
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <Link key={v.key} href={`/admin/vehicles/${encodeURIComponent(v.key)}`}>
              <AdminCard className="p-4">
                <p className="font-semibold text-white">{v.vehicle}</p>
                <p className="text-sm text-[#9CA3AF]">
                  Owner: {v.ownerName} · {v.bookings.length} service{v.bookings.length === 1 ? "" : "s"}
                  {v.lastDetailMs != null ? ` · last ${formatElapsedLong(v.lastDetailMs)}` : ""}
                </p>
              </AdminCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
