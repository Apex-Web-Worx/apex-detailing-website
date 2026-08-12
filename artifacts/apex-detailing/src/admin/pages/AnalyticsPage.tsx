import { useAdmin } from "../context";
import { formatPrice, todayDateString } from "@/lib/format";
import { computeKpis, displayStatus, formatSignedPercent, monthLabel, monthlySeries, percentChange } from "../utils";
import { AdminCard, Sparkline } from "../components/ui";

export default function AnalyticsPage() {
  const { bookings } = useAdmin();
  const kpis = computeKpis(bookings);
  const series = monthlySeries(bookings, 6);
  const thisMonth = todayDateString().slice(0, 7);
  const prev = series.length >= 2 ? series[series.length - 2].cents : 0;
  const change = percentChange(kpis.monthCollectedCents, prev);
  const completed = bookings.filter((b) => displayStatus(b) === "completed").length;
  const avg =
    completed === 0
      ? 0
      : bookings.filter((b) => displayStatus(b) === "completed").reduce((s, b) => s + b.servicePriceCents, 0) / completed;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <Stat label="Revenue" value={formatPrice(kpis.monthCollectedCents)} hint={monthLabel(thisMonth)} />
        <Stat label="Appointments" value={String(bookings.filter((b) => b.status !== "cancelled").length)} hint="All non-cancelled" />
        <Stat label="Avg booking value" value={formatPrice(Math.round(avg))} hint="Completed only" />
        <Stat label="Completed services" value={String(completed)} hint="Past confirmed" />
        <Stat label="Upcoming quoted" value={String(kpis.upcomingQuotedCount)} hint="Confirmed future" />
      </div>
      <AdminCard hover={false} className="p-5">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <h3 className="font-bold">Revenue</h3>
            <p className="text-sm text-[#9CA3AF]">{formatSignedPercent(change)} vs previous month</p>
          </div>
          <p className="text-2xl font-bold">{formatPrice(kpis.monthCollectedCents)}</p>
        </div>
        <Sparkline values={series.map((s) => s.cents)} />
        <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-2">
          {series.map((s) => (
            <span key={s.month}>{s.month.slice(5)}</span>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <AdminCard hover={false} className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-[#9CA3AF] mt-1">{hint}</p>
    </AdminCard>
  );
}
