import { useAdmin } from "../context";
import ServiceRulesPanel from "../components/ServiceRulesPanel";

export default function ServicesPage() {
  const { token } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Services</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Edit the <span className="text-white font-medium">Booking schedule</span> — which days and times each
          package is bookable. Rules are not deleted when you leave this page.
        </p>
      </div>
      <ServiceRulesPanel token={token} />
    </div>
  );
}
