import { formatPrice } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingIso, bookingShopDate, displayStatus } from "../utils";
import { AdminCard, EmptyState, StatusBadge } from "../components/ui";

export default function PaymentsPage() {
  const { bookings, setDetail } = useAdmin();
  const rows = [...bookings].sort((a, b) => +new Date(bookingIso(b)) - +new Date(bookingIso(a)));
  const collected = rows.filter((b) => displayStatus(b) === "completed").reduce((s, b) => s + b.servicePriceCents, 0);
  const upcoming = rows.filter((b) => displayStatus(b) === "confirmed").reduce((s, b) => s + b.servicePriceCents, 0);
  const cancelled = rows.filter((b) => displayStatus(b) === "cancelled").reduce((s, b) => s + b.servicePriceCents, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payments</h2>
      <p className="text-sm text-[#9CA3AF]">
        There is no payment processor ledger. These totals are quoted service prices from bookings.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminCard hover={false} className="p-4">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Collected</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(collected)}</p>
          <p className="text-xs text-[#9CA3AF]">Completed appointments</p>
        </AdminCard>
        <AdminCard hover={false} className="p-4">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Pending</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(upcoming)}</p>
          <p className="text-xs text-[#9CA3AF]">Upcoming quoted</p>
        </AdminCard>
        <AdminCard hover={false} className="p-4">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">Cancelled</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(cancelled)}</p>
        </AdminCard>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No payment rows" body="Booking amounts will appear here." />
      ) : (
        <div className="space-y-2">
          {rows.map((b) => (
            <button key={b.id} type="button" onClick={() => setDetail(b)} className="w-full text-left">
              <AdminCard className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{b.customerName}</p>
                    <p className="text-sm text-[#9CA3AF] truncate">{b.serviceName} · {bookingShopDate(b)}</p>
                  </div>
                  <StatusBadge status={displayStatus(b)} />
                  <span className="font-semibold">{formatPrice(b.servicePriceCents)}</span>
                </div>
              </AdminCard>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
