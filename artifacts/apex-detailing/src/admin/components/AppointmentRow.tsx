import { useState } from "react";
import { Link } from "wouter";
import type { Booking } from "@workspace/api-client-react";
import { MoreHorizontal } from "lucide-react";
import { formatDuration, formatTime12h } from "@/lib/format";
import VehiclePhoto from "@/components/VehiclePhoto";
import { displayStatus, notesPreview, bookingShopDate, bookingShopTime } from "../utils";
import { StatusBadge } from "./ui";

export default function AppointmentRow({
  booking,
  onView,
  onEdit,
  onCancel,
}: {
  booking: Booking;
  onView: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const status = displayStatus(booking);
  const preview = notesPreview(booking.notes);
  const canAct = status === "confirmed";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 hover:bg-[#161616] transition duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <button type="button" onClick={onView} className="flex-1 min-w-0 text-left">
          <div className="flex items-start gap-3">
            <VehiclePhoto vehicle={booking.vehicle} size="sm" className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-bold text-white w-20 shrink-0">
                  {formatTime12h(bookingShopTime(booking))}
                </span>
                <span className="font-semibold text-white">{booking.serviceName}</span>
                <span className="text-xs text-[#9CA3AF]">{formatDuration(booking.serviceDurationMinutes)}</span>
              </div>
              <div className="mt-1 text-sm text-[#9CA3AF] truncate">
                {booking.vehicle} · {booking.customerName}
              </div>
              {preview && (
                <p className="mt-1 text-xs text-[#9CA3AF]/80 truncate">{preview}</p>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="hidden sm:inline text-xs text-[#9CA3AF]">{bookingShopDate(booking)}</span>
          <StatusBadge status={status} />
          <button
            type="button"
            onClick={onView}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-white/10 hover:bg-white/5"
          >
            View Details
          </button>
          {canAct && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="h-8 px-3 rounded-lg text-xs font-medium border border-white/10 hover:bg-white/5"
            >
              Edit
            </button>
          )}
          {canAct && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="h-8 px-3 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10"
            >
              Cancel
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menu && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-white/10 bg-[#0B0B0B] py-1 z-10">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => {
                    setMenu(false);
                    onView();
                  }}
                >
                  View
                </button>
                {canAct && onEdit && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                    onClick={() => {
                      setMenu(false);
                      onEdit();
                    }}
                  >
                    Edit
                  </button>
                )}
                <a
                  href={`tel:${booking.phone}`}
                  className="block px-3 py-2 text-sm hover:bg-white/5"
                >
                  Call
                </a>
                {booking.manageToken && (
                  <Link
                    href={`/manage/${booking.id}?token=${booking.manageToken}`}
                    className="block px-3 py-2 text-sm hover:bg-white/5"
                  >
                    Customer link
                  </Link>
                )}
                {canAct && onCancel && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      setMenu(false);
                      onCancel();
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
