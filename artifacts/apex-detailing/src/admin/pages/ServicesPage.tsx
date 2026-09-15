import { Link } from "wouter";
import { Clock } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/format";
import { useAdmin } from "../context";
import { AdminCard, EmptyState, GhostButton } from "../components/ui";

export default function ServicesPage() {
  const { services } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Services</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Catalog prices come from the database. There is no admin API to edit name, price, or duration yet.
        </p>
      </div>
      {services.length === 0 ? (
        <EmptyState title="No services" body="Services will appear from the public catalog." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {services.map((s) => (
            <AdminCard key={s.id} hover={false} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-white">{s.name}</h3>
                <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${s.active ? "border-emerald-500/30 text-emerald-300" : "border-white/10 text-[#9CA3AF]"}`}>
                  {s.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-sm text-[#9CA3AF] mt-2">{s.description}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <span>{formatDuration(s.durationMinutes)}</span>
                <span className="font-semibold">{formatPrice(s.priceCents)} starting</span>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
      <AdminCard hover={false} className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <Clock className="w-5 h-5 text-[#23B9FF] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white">Booking days & times</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Weekday hours, Friday short-service slots, and whole-day lock are edited on the Rules tab.
              </p>
            </div>
          </div>
          <Link href="/admin/rules" className="shrink-0">
            <GhostButton type="button" className="w-full sm:w-auto">
              Open Rules
            </GhostButton>
          </Link>
        </div>
      </AdminCard>
    </div>
  );
}
