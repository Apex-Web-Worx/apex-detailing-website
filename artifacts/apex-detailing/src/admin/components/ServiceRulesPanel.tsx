import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListServiceRules,
  adminCreateServiceRule,
  adminUpdateServiceRule,
  adminDeleteServiceRule,
  adminAddRuleSlot,
  adminRemoveRuleSlot,
  getAdminListServiceRulesQueryKey,
  useListServices,
  type ServiceDayRule,
  type Service,
} from "@workspace/api-client-react";
import { Clock, Loader2, Plus, Trash2, X as XIcon } from "lucide-react";
import { fieldClass, GhostButton, PrimaryButton } from "./ui";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHHMM12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function ServiceRulesPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const headers = { "x-admin-token": token };
  const { data: rules, isLoading } = useAdminListServiceRules({
    request: { headers },
    query: { queryKey: getAdminListServiceRulesQueryKey(), retry: false },
  });
  const { data: services } = useListServices();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListServiceRulesQueryKey() });

  const byService = useMemo(() => {
    const map = new Map<number, { name: string; slug: string; rules: ServiceDayRule[] }>();
    for (const r of rules ?? []) {
      const entry = map.get(r.serviceId) ?? { name: r.serviceName, slug: r.serviceSlug, rules: [] };
      entry.rules.push(r);
      map.set(r.serviceId, entry);
    }
    return map;
  }, [rules]);

  const [newServiceId, setNewServiceId] = useState<number | "">("");
  const [newDow, setNewDow] = useState<number>(1);
  const [newWholeDay, setNewWholeDay] = useState<boolean>(true);
  const [newSlotsCsv, setNewSlotsCsv] = useState<string>("07:30, 08:00");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceId === "") return;
    setAddError(null);
    setAdding(true);
    try {
      const slots = newSlotsCsv.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
      for (const t of slots) {
        if (!/^\d{2}:\d{2}$/.test(t)) throw new Error(`"${t}" is not a valid HH:MM time.`);
      }
      await adminCreateServiceRule(
        { serviceId: Number(newServiceId), dayOfWeek: newDow, wholeDayLock: newWholeDay, slots },
        { headers },
      );
      setNewSlotsCsv("07:30, 08:00");
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add rule";
      setAddError(/409/.test(msg) ? "A rule for that service and day already exists. Edit it instead." : msg);
    } finally {
      setAdding(false);
    }
  };

  const toggleLock = async (rule: ServiceDayRule) => {
    try {
      await adminUpdateServiceRule(rule.id, { wholeDayLock: !rule.wholeDayLock }, { headers });
      refresh();
    } catch (e) {
      alert(`Could not update: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };
  const toggleActive = async (rule: ServiceDayRule) => {
    try {
      await adminUpdateServiceRule(rule.id, { active: !rule.active }, { headers });
      refresh();
    } catch (e) {
      alert(`Could not update: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };
  const deleteRule = async (rule: ServiceDayRule) => {
    if (!confirm(`Delete the ${DOW_LONG[rule.dayOfWeek]} rule for ${rule.serviceName}? Customers will no longer be able to book it on ${DOW_LONG[rule.dayOfWeek]}s.`)) {
      return;
    }
    try {
      await adminDeleteServiceRule(rule.id, { headers });
      refresh();
    } catch (e) {
      alert(`Could not delete: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };
  const addSlot = async (rule: ServiceDayRule, time: string) => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      alert("Time must be HH:MM (24-hour), e.g. 07:30 or 14:00.");
      return;
    }
    try {
      await adminAddRuleSlot(rule.id, { time }, { headers });
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      if (/409/.test(msg)) alert("That time slot already exists for this rule.");
      else alert(`Could not add slot: ${msg}`);
    }
  };
  const removeSlot = async (rule: ServiceDayRule, slotId: number) => {
    try {
      await adminRemoveRuleSlot(rule.id, slotId, { headers });
      refresh();
    } catch (e) {
      alert(`Could not remove: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-2">
        <Clock className="w-5 h-5 text-[#23B9FF]" />
        <h2 className="text-xl font-bold">Booking schedule</h2>
      </div>
      <p className="text-sm text-[#9CA3AF] mb-5">
        Choose which days each service is bookable, the times offered, and whether one booking takes the whole day. Sundays stay closed automatically.
      </p>
      <form onSubmit={addRule} className="grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr_0.5fr_1.4fr_auto] gap-3 mb-5 p-4 rounded-2xl border border-white/10 bg-[#111111]">
        <select
          value={newServiceId}
          onChange={(e) => setNewServiceId(e.target.value === "" ? "" : Number(e.target.value))}
          className={fieldClass}
          required
        >
          <option value="">Pick a service…</option>
          {(services ?? []).map((s: Service) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select value={newDow} onChange={(e) => setNewDow(Number(e.target.value))} className={fieldClass}>
          {DOW_LABELS.map((label, i) => (
            <option key={i} value={i} disabled={i === 0}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm cursor-pointer">
          <input type="checkbox" checked={newWholeDay} onChange={(e) => setNewWholeDay(e.target.checked)} className="accent-[#FF2AD4]" />
          Whole-day lock
        </label>
        <input
          type="text"
          value={newSlotsCsv}
          onChange={(e) => setNewSlotsCsv(e.target.value)}
          placeholder="Times (HH:MM, comma-separated)"
          className={fieldClass}
        />
        <PrimaryButton type="submit" disabled={newServiceId === "" || adding} className="whitespace-nowrap">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add rule
        </PrimaryButton>
      </form>
      {addError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{addError}</div>
      )}
      {isLoading ? (
        <div className="flex items-center gap-3 text-[#9CA3AF] py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading rules…
        </div>
      ) : byService.size === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center text-sm text-[#9CA3AF]">
          No rules yet. Add one above to make a service bookable.
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byService.entries()).map(([sid, group]) => (
            <div key={sid} className="rounded-2xl border border-white/10 bg-[#111111] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="font-bold text-white">{group.name}</div>
                <div className="text-xs text-[#9CA3AF]">{group.slug}</div>
              </div>
              <div className="divide-y divide-white/5">
                {group.rules.slice().sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((r) => (
                  <RuleRow
                    key={r.id}
                    rule={r}
                    onToggleLock={() => toggleLock(r)}
                    onToggleActive={() => toggleActive(r)}
                    onDelete={() => deleteRule(r)}
                    onAddSlot={(t) => addSlot(r, t)}
                    onRemoveSlot={(slotId) => removeSlot(r, slotId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RuleRow({
  rule,
  onToggleLock,
  onToggleActive,
  onDelete,
  onAddSlot,
  onRemoveSlot,
}: {
  rule: ServiceDayRule;
  onToggleLock: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onAddSlot: (time: string) => void;
  onRemoveSlot: (slotId: number) => void;
}) {
  const [newTime, setNewTime] = useState("");
  return (
    <div className={`p-4 ${rule.active ? "" : "opacity-50"}`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="font-bold text-white min-w-[60px]">{DOW_LONG[rule.dayOfWeek]}</div>
        <button
          onClick={onToggleLock}
          title={rule.wholeDayLock ? "One booking on this day blocks all other bookings of any service." : "Multiple bookings can coexist across the configured time slots."}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            rule.wholeDayLock ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {rule.wholeDayLock ? "Whole day" : "Per slot"}
        </button>
        <button
          onClick={onToggleActive}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            rule.active ? "bg-white/5 border-white/20 text-gray-300" : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {rule.active ? "Active" : "Paused"}
        </button>
        <div className="ml-auto">
          <button onClick={onDelete} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-300 hover:bg-red-500/10" title="Delete this rule">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {rule.slots.length === 0 && <span className="text-xs text-[#9CA3AF] italic">No times yet — add one →</span>}
        {rule.slots.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
            <Clock className="w-3 h-3 text-[#23B9FF]" />
            {formatHHMM12h(s.time)}
            <button onClick={() => onRemoveSlot(s.id)} className="ml-1 text-[#9CA3AF] hover:text-red-300" title={`Remove ${s.time}`}>
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-xs text-white focus:border-[#FF2AD4] focus:outline-none" />
        <GhostButton
          type="button"
          className="h-8 px-3 text-xs"
          onClick={() => {
            if (!newTime) return;
            onAddSlot(newTime);
            setNewTime("");
          }}
          disabled={!newTime}
        >
          + Add time
        </GhostButton>
      </div>
    </div>
  );
}
