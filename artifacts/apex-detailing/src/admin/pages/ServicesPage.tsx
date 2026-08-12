import { formatDuration, formatPrice } from "@/lib/format";
import { useAdmin } from "../context";
import ServiceRulesPanel from "../components/ServiceRulesPanel";
import { AdminCard, EmptyState } from "../components/ui";

export default function ServicesPage() {
  const { token, services } = useAdmin();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      <ServiceRulesPanel token={token} />
    </div>
  );
}
