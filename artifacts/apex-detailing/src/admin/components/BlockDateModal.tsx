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

const dateFieldClass = `${fieldClass} min-h-12 text-base [color-scheme:dark]`;

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
  const { token, blockOpen, blockPrefillDate, editingBlocked, closeBlockDate } = useAdmin();
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
        className="w-full sm:max-w-md bg-[#0B0B0B] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[92dvh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-bold">
            {isEditing ? "Edit blocked date" : isRange ? "Block Dates" : "Block Date"}
          </h2>
          <button
            type="button"
            onClick={closeBlockDate}
            className="w-11 h-11 shrink-0 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Google-style From / To — native date fields, stacked for mobile */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
            {isEditing ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  min={dateMin}
                  required
                  onChange={(e) => setDate(e.target.value)}
                  className={dateFieldClass}
                />
              </label>
            ) : (
              <>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                    From
                  </span>
                  <input
                    type="date"
                    value={date}
                    min={dateMin}
                    required
                    onChange={(e) => {
                      const next = e.target.value;
                      setDate(next);
                      if (!endDate || endDate < next) setEndDate(next);
                    }}
                    className={dateFieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                    To
                  </span>
                  <input
                    type="date"
                    value={effectiveEnd}
                    min={date || today}
                    required
                    onChange={(e) => setEndDate(e.target.value)}
                    className={dateFieldClass}
                  />
                </label>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  {isRange
                    ? `${rangeDays} days will be blocked (shop closed). Max 31.`
                    : "Same date = one day. Later To date = whole trip (e.g. a week)."}
                </p>
              </>
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
              className={`${fieldClass} min-h-12 text-base`}
            />
          </label>

          {!isRange && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                Optional customer / contact
              </p>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                {isEditing
                  ? "Name, phone, or vehicle makes this day an appointment. Changing phone or date sends a confirmation text."
                  : "Add contact to hold one day as an appointment. For a multi-day shop close, set a later To date instead."}
              </p>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  maxLength={100}
                  className={`${fieldClass} min-h-12 text-base`}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                  maxLength={100}
                  className={`${fieldClass} min-h-12 text-base`}
                  autoComplete="family-name"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Phone"
                  maxLength={14}
                  className={`${fieldClass} min-h-12 text-base`}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="Vehicle, e.g. 2022 BMW M4"
                  maxLength={120}
                  className={`${fieldClass} min-h-12 text-base`}
                />
              </div>
            </div>
          )}

          {isRange && (
            <p className="text-xs text-[#9CA3AF] rounded-xl border border-white/10 bg-white/[0.02] p-3 leading-relaxed">
              Multi-day blocks close the shop for the whole range. Customer holds stay single-day —
              set To equal to From to add a contact hold.
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5">
          <GhostButton type="button" onClick={closeBlockDate} className="min-h-12 w-full sm:w-auto">
            Cancel
          </GhostButton>
          <PrimaryButton
            type="submit"
            disabled={!date || submitting}
            className="min-h-12 w-full sm:w-auto"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEditing ? "Save" : isRange ? `Block ${rangeDays} Days` : "Block Date"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
