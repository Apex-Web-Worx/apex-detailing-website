import { useState } from "react";
import { MoreHorizontal, Phone, Play } from "lucide-react";
import type { BlockedDate } from "@workspace/api-client-react";
import { formatDateShort } from "@/lib/format";
import { canStartHold, holdDisplayStatus, heldCustomerName, holdServiceLabel } from "../utils";
import { useAdmin } from "../context";
import { StatusBadge } from "./ui";

export default function HeldAppointmentRow({
  hold,
  stackedAction = false,
}: {
  hold: BlockedDate;
  stackedAction?: boolean;
}) {
  const { openEditBlockedDate, startHold } = useAdmin();
  const name = heldCustomerName(hold);
  const vehicle = hold.vehicle?.trim() || "";
  const status = holdDisplayStatus(hold);
  const canStart = canStartHold(hold);
  const [menu, setMenu] = useState(false);

  const startButton = canStart ? (
    <button
      type="button"
      onClick={() => void startHold(hold.id)}
      className={
        stackedAction
          ? "mt-3 w-full min-h-12 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#ff4adc] touch-manipulation"
          : "mt-3 w-full min-h-12 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#ff4adc] touch-manipulation md:mt-0 md:w-auto md:h-11 md:min-h-11 md:px-4 md:whitespace-nowrap"
      }
    >
      <Play className="w-4 h-4" /> Start detailing
    </button>
  ) : null;

  const icons = (
    <div className="flex flex-col md:flex-row items-center gap-1.5 shrink-0">
      {hold.phone ? (
        <a
          href={`tel:${hold.phone}`}
          className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#23B9FF] hover:bg-white/5 touch-manipulation"
          aria-label={`Call ${name}`}
        >
          <Phone className="w-4 h-4" />
        </a>
      ) : null}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 touch-manipulation"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menu && (
          <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border border-white/10 bg-[#0B0B0B] py-1 z-20 shadow-xl">
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
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-3 py-3 md:px-4 hover:bg-[#161616] transition duration-200">
      <div className="md:hidden">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => openEditBlockedDate(hold)}
            className="flex-1 min-w-0 text-left touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white shrink-0">All day</span>
              <StatusBadge status={status} />
            </div>
            <p className="mt-0.5 font-semibold text-white leading-snug">{holdServiceLabel(hold)}</p>
            <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
              {[name, vehicle].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-[#9CA3AF]">
              {formatDateShort(hold.date)} · All day
            </p>
          </button>
          {icons}
        </div>
        {startButton}
      </div>

      <div className="hidden md:flex md:items-center md:gap-3">
        <button
          type="button"
          onClick={() => openEditBlockedDate(hold)}
          className="flex items-center gap-4 min-w-0 text-left"
        >
          <div className="shrink-0">
            <p className="text-sm font-bold text-white leading-none">All day</p>
            <div className="mt-1.5">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white leading-snug truncate">{holdServiceLabel(hold)}</p>
            <p className="mt-0.5 text-sm text-[#9CA3AF] truncate">
              {[name, vehicle].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-[#9CA3AF] truncate">
              {formatDateShort(hold.date)} · All day
            </p>
          </div>
        </button>
        {startButton && !stackedAction ? <div className="shrink-0">{startButton}</div> : null}
        <div className="ml-auto shrink-0">{icons}</div>
      </div>
      {startButton && stackedAction ? <div className="hidden md:block">{startButton}</div> : null}
    </div>
  );
}
