import { useAdmin } from "../context";
import ServiceRulesPanel from "../components/ServiceRulesPanel";

export default function RulesPage() {
  const { token } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Booking rules</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Choose which services can be booked on which weekdays, the times offered, and whether one booking locks the whole day. Sundays stay closed automatically. Changes apply to the public calendar immediately; existing appointments are not moved.
        </p>
      </div>
      <ServiceRulesPanel token={token} />
    </div>
  );
}
