import type { BlockedDate } from "@workspace/api-client-react";
import { Phone } from "lucide-react";
import { holdDisplayStatus, heldCustomerName, holdServiceLabel } from "../utils";
import { useAdmin } from "../context";
import { StatusBadge } from "./ui";

export default function HeldAppointmentRow({
  hold,
}: {
  hold: BlockedDate;
}) {
  const { openEditBlockedDate } = useAdmin();
  const name = heldCustomerName(hold);
  const vehicle = hold.vehicle?.trim() || "";
  const status = holdDisplayStatus(hold);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200">
      <div className="flex items-start md:items-center gap-3">
        <button
          type="button"
          onClick={() => openEditBlockedDate(hold)}
          className="flex-1 min-w-0 text-left touch-manipulation md:grid md:grid-cols-[7.5rem_minmax(12rem,1.4fr)_minmax(8rem,0.8fr)] md:items-center md:gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white shrink-0">All day</span>
            <StatusBadge status={status} />
          </div>
          <div className="min-w-0">
            <p className="mt-0.5 md:mt-0 font-semibold text-white leading-snug truncate">
              {holdServiceLabel(hold)}
            </p>
            <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
              {[name, vehicle].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-[#9CA3AF] md:hidden">{hold.date} · All day</p>
          </div>
          <p className="hidden md:block text-sm text-[#9CA3AF] truncate">{hold.date} · All day</p>
        </button>
        {hold.phone ? (
          <a
            href={`tel:${hold.phone}`}
            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#23B9FF] hover:bg-white/5 touch-manipulation shrink-0"
            aria-label={`Call ${name}`}
          >
            <Phone className="w-4 h-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
