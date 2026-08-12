import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminAddBlockedDate,
  getAdminListBlockedDatesQueryKey,
} from "@workspace/api-client-react";
import { Loader2, X } from "lucide-react";
import { todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import { fieldClass, GhostButton, PrimaryButton } from "./ui";

export default function BlockDateModal() {
  const { token, blockOpen, blockPrefillDate, closeBlockDate } = useAdmin();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  useEffect(() => {
    if (!blockOpen) return;
    setDate(blockPrefillDate);
    setReason("");
    setName("");
    setSurname("");
    setPhone("");
    setError(null);
    setSuccessNote(null);
  }, [blockOpen, blockPrefillDate]);

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

  if (!blockOpen) return null;

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError(null);
    setSuccessNote(null);
    try {
      const payload: {
        date: string;
        reason?: string;
        name?: string;
        surname?: string;
        phone?: string;
      } = { date };
      const reasonTrim = reason.trim();
      const nameTrim = name.trim();
      const surnameTrim = surname.trim();
      const phoneTrim = phone.trim();
      if (reasonTrim) payload.reason = reasonTrim;
      if (nameTrim) payload.name = nameTrim;
      if (surnameTrim) payload.surname = surnameTrim;
      if (phoneTrim) payload.phone = phoneTrim;

      await adminAddBlockedDate(payload, {
        headers: { "x-admin-token": token },
      });
      setSuccessNote(
        phoneTrim
          ? `Date blocked. Confirmation text sent to ${phoneTrim}.`
          : "Date blocked.",
      );
      queryClient.invalidateQueries({
        queryKey: getAdminListBlockedDatesQueryKey(),
      });
      setTimeout(() => closeBlockDate(), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not block date";
      if (/409/.test(msg)) {
        setError("That date is already blocked.");
      } else if (/400/.test(msg)) {
        setError("Pick a valid date that is today or later.");
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
        onSubmit={add}
        className="w-full sm:max-w-lg bg-[#0B0B0B] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Block Date</h2>
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
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayDateString()}
              required
              className={fieldClass}
            />
          </label>
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
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Optional customer / contact
            </p>
            <p className="text-xs text-[#9CA3AF]">
              If you add a phone number, we send them an appointment confirmation text.
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
          </div>
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
            Block Date
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
