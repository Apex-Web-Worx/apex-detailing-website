import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Phone, Play } from "lucide-react";
import type { BlockedDate } from "@workspace/api-client-react";
import { formatDateShort } from "@/lib/format";
import { canStartHold, holdDisplayStatus, heldCustomerName, holdServiceLabel } from "../utils";
import { useAdmin } from "../context";
import { StatusBadge } from "./ui";

export default function HeldAppointmentRow({
  hold,
}: {
  hold: BlockedDate;
}) {
  const { openEditBlockedDate, startHold } = useAdmin();
  const name = heldCustomerName(hold);
  const vehicle = hold.vehicle?.trim() || "";
  const status = holdDisplayStatus(hold);
  const canStart = canStartHold(hold);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const startButton = canStart ? (
    <button
      type="button"
      onClick={() => void startHold(hold.id)}
      className="min-h-11 h-11 px-3 rounded-xl bg-[#FF2AD4] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#ff4adc] touch-manipulation whitespace-nowrap flex-1 md:flex-none"
    >
      <Play className="w-3.5 h-3.5" /> Start detailing
    </button>
  ) : null;

  const actions = (
    <div className="flex w-full md:w-auto flex-row items-center gap-1.5 shrink-0">
      {startButton}
      {hold.phone ? (
        <a
          href={`tel:${hold.phone}`}
          className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#23B9FF] hover:bg-white/5 touch-manipulation shrink-0"
          aria-label={`Call ${name}`}
        >
          <Phone className="w-4 h-4" />
        </a>
      ) : null}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 touch-manipulation"
          aria-label="More actions"
          aria-expanded={menu}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menu ? (
          <div className="absolute right-0 top-full mt-1 w-44 max-h-[min(20rem,60vh)] overflow-y-auto rounded-xl border border-white/10 bg-[#0B0B0B] py-1 z-50 shadow-xl">
            <button
              type="button"
              className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
              onClick={() => {
                setMenu(false);
                openEditBlockedDate(hold);
              }}
            >
              Edit
            </button>
            {canStart ? (
              <button
                type="button"
                className="w-full text-left px-3 py-3 text-sm hover:bg-white/5 min-h-11"
                onClick={() => {
                  setMenu(false);
                  void startHold(hold.id);
                }}
              >
                Start detailing
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200 overflow-visible">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <button
          type="button"
          onClick={() => openEditBlockedDate(hold)}
          className="flex items-start md:items-center gap-3 min-w-0 flex-1 text-left touch-manipulation"
        >
          <div className="shrink-0">
            <p className="text-sm font-bold text-white leading-none">All day</p>
            <div className="mt-1.5 hidden md:block">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 md:hidden">
              <StatusBadge status={status} />
            </div>
            <p className="font-semibold text-white leading-snug truncate">{holdServiceLabel(hold)}</p>
            <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
              {[name, vehicle].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-[#9CA3AF] truncate">
              {formatDateShort(hold.date)} · All day
            </p>
          </div>
        </button>
        {actions}
      </div>
    </div>
  );
}
