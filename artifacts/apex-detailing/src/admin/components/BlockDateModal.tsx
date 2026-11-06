import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminAddBlockedDate,
  getAdminListBlockedDatesQueryKey,
  getAdminListBookingsQueryKey,
} from "@workspace/api-client-react";
import { Loader2, X } from "lucide-react";
import { todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import { fieldClass, GhostButton, PrimaryButton } from "./ui";
import AdminDatePicker from "./AdminDatePicker";

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Inclusive day count between YYYY-MM-DD strings (UTC calendar). */
function daySpan(start: string, end: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 0;
  const a = Date.UTC(+start.slice(0, 4), +start.slice(5, 7) - 1, +start.slice(8, 10));
  const b = Date.UTC(+end.slice(0, 4), +end.slice(5, 7) - 1, +end.slice(8, 10));
  if (b < a) return 0;
  return Math.floor((b - a) / 86_400_000) + 1;
}

async function adminUpdateBlockedDate(
  originalDate: string,
  payload: {
    date: string;
    reason: string;
    name: string;
    surname: string;
    phone: string;
    vehicle: string;
  },
  token: string,
) {
  const res = await fetch(
    `/api/admin/blocked-dates/${encodeURIComponent(originalDate)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }
}

async function adminAddBlockedDateRange(
  payload: {
    date: string;
    endDate: string;
    reason?: string;
  },
  token: string,
) {
  const res = await fetch("/api/admin/blocked-dates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`${res.status} ${text}`);
  }
  try {
    return JSON.parse(text) as {
      count?: number;
      skipped?: string[];
      startDate?: string;
      endDate?: string;
    };
  } catch {
    return {};
  }
}

export default function BlockDateModal() {
  const { token, blockOpen, blockPrefillDate, editingBlocked, closeBlockDate, bookings, blockedDates } =
    useAdmin();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const isEditing = Boolean(editingBlocked);

  useEffect(() => {
    if (!blockOpen) return;
    if (editingBlocked) {
      setDate(editingBlocked.date);
      setEndDate(editingBlocked.date);
      setReason(editingBlocked.reason ?? "");
      setName(editingBlocked.name ?? "");
      setSurname(editingBlocked.surname ?? "");
      setPhone(formatPhone(editingBlocked.phone ?? ""));
      setVehicle(editingBlocked.vehicle ?? "");
    } else {
      setDate(blockPrefillDate);
      setEndDate(blockPrefillDate);
      setReason("");
      setName("");
      setSurname("");
      setPhone("");
      setVehicle("");
    }
    setError(null);
    setSuccessNote(null);
  }, [blockOpen, blockPrefillDate, editingBlocked]);

  useEffect(() => {
    if (!blockOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBlockDate();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [blockOpen, closeBlockDate]);

  const today = todayDateString();
  const dateMin =
    isEditing &&
    editingBlocked &&
    date === editingBlocked.date &&
    editingBlocked.date < today
      ? editingBlocked.date
      : today;

  const effectiveEnd = endDate && endDate >= date ? endDate : date;
  const rangeDays = useMemo(
    () => (date ? daySpan(date, effectiveEnd) : 0),
    [date, effectiveEnd],
  );
  const isRange = !isEditing && rangeDays > 1;

  if (!blockOpen) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    if (isRange && endDate < date) {
      setError("End date must be on or after the start date.");
      return;
    }
    if (isRange && rangeDays > 31) {
      setError("You can block at most 31 days at once.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessNote(null);
    try {
      const reasonTrim = reason.trim();
      const nameTrim = name.trim();
      const surnameTrim = surname.trim();
      const phoneTrim = phone.trim();
      const vehicleTrim = vehicle.trim();

      if (editingBlocked) {
        await adminUpdateBlockedDate(
          editingBlocked.date,
          {
            date,
            reason: reasonTrim,
            name: nameTrim,
            surname: surnameTrim,
            phone: phoneTrim,
            vehicle: vehicleTrim,
          },
          token,
        );
        const phoneChanged =
          phoneDigits(phoneTrim) !== phoneDigits(editingBlocked.phone ?? "");
        const dateChanged = date !== editingBlocked.date;
        setSuccessNote(
          phoneTrim && (phoneChanged || dateChanged)
            ? `Saved. Confirmation text sent to ${phoneTrim}.`
            : "Blocked date updated.",
        );
      } else if (isRange) {
        const payload: { date: string; endDate: string; reason?: string } = {
          date,
          endDate: effectiveEnd,
        };
        if (reasonTrim) payload.reason = reasonTrim;
        const result = await adminAddBlockedDateRange(payload, token);
        const created = result.count ?? rangeDays;
        const skipped = result.skipped?.length ?? 0;
        setSuccessNote(
          skipped > 0
            ? `Blocked ${created} day${created === 1 ? "" : "s"}. Skipped ${skipped} already blocked.`
            : `Blocked ${created} day${created === 1 ? "" : "s"} (${date} → ${effectiveEnd}).`,
        );
      } else {
        const payload: {
          date: string;
          reason?: string;
          name?: string;
          surname?: string;
          phone?: string;
          vehicle?: string;
        } = { date };
        if (reasonTrim) payload.reason = reasonTrim;
        if (nameTrim) payload.name = nameTrim;
        if (surnameTrim) payload.surname = surnameTrim;
        if (phoneTrim) payload.phone = phoneTrim;
        if (vehicleTrim) payload.vehicle = vehicleTrim;

        await adminAddBlockedDate(payload, {
          headers: { "x-admin-token": token },
        });
        setSuccessNote(
          phoneTrim
            ? `Date blocked. Confirmation text sent to ${phoneTrim}.`
            : "Date blocked.",
        );
      }
      queryClient.invalidateQueries({
        queryKey: getAdminListBlockedDatesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getAdminListBookingsQueryKey(),
      });
      setTimeout(() => closeBlockDate(), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save blocked date";
      if (/409/.test(msg)) {
        setError(
          isRange
            ? "All dates in that range are already blocked."
            : "That date is already blocked.",
        );
      } else if (/404/.test(msg)) {
        setError("That blocked date was not found. It may have already been re-opened.");
      } else if (/400/.test(msg)) {
        if (/Contact holds/i.test(msg)) {
          setError("Contact holds are single-day only. Clear contact fields or block one day.");
        } else if (/31 days/i.test(msg)) {
          setError("You can block at most 31 days at once.");
        } else if (/End date/i.test(msg)) {
          setError("End date must be on or after the start date.");
        } else {
          setError("Pick a valid date that is today or later.");
        }
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={closeBlockDate}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="w-full sm:max-w-lg bg-[#0B0B0B] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {isEditing ? "Edit blocked date" : isRange ? "Block Dates" : "Block Date"}
          </h2>
          <button
            type="button"
            onClick={closeBlockDate}
            className="w-9 h-9 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>
        <div className="space-y-3">
          <div className={`grid gap-3 ${isEditing ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                {isEditing ? "Date" : "From"}
              </span>
              <AdminDatePicker
                value={date}
                onChange={(next) => {
                  setDate(next);
                  if (!isEditing && (!endDate || endDate < next)) setEndDate(next);
                }}
                minDate={dateMin}
                bookings={bookings}
                blockedDates={blockedDates}
                allowDate={editingBlocked?.date}
                disableBlocked
                required
              />
            </div>
            {!isEditing && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                  To
                </span>
                <AdminDatePicker
                  value={effectiveEnd}
                  onChange={setEndDate}
                  minDate={date || today}
                  bookings={bookings}
                  blockedDates={blockedDates}
                  disableBlocked={false}
                  required
                />
                <p className="mt-1.5 text-xs text-[#9CA3AF]">
                  {isRange
                    ? `Blocks ${rangeDays} days (shop closed). Max 31.`
                    : "Same as start = one day. Pick a later end to block a week trip."}
                </p>
              </div>
            )}
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
              Reason
            </span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional, e.g. Family trip"
              maxLength={200}
              className={fieldClass}
            />
          </label>
          {!isRange && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                Optional customer / contact
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {isEditing
                  ? "Name, phone, or vehicle makes this day count as an appointment. Changing the phone or moving the date sends a confirmation text. Name-only changes do not resend."
                  : "Add a name, phone, or vehicle to hold this day as an appointment. A phone number also sends a confirmation text. For a multi-day shop close, set a later To date instead."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  maxLength={100}
                  className={fieldClass}
                />
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                  maxLength={100}
                  className={fieldClass}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Phone"
                  maxLength={14}
                  className={fieldClass}
                />
              </div>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="Vehicle, e.g. 2022 BMW M4"
                maxLength={120}
                className={fieldClass}
              />
            </div>
          )}
          {isRange && (
            <p className="text-xs text-[#9CA3AF] rounded-xl border border-white/10 bg-white/[0.02] p-3">
              Multi-day blocks close the shop for every day in the range. Customer holds stay
              single-day — clear the To date (or set it equal to From) to add a contact hold.
            </p>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}
        {successNote && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            {successNote}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <GhostButton type="button" onClick={closeBlockDate}>
            Cancel
          </GhostButton>
          <PrimaryButton type="submit" disabled={!date || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEditing ? "Save" : isRange ? `Block ${rangeDays} Days` : "Block Date"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
