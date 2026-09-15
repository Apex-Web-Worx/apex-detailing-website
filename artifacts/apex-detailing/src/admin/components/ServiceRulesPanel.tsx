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
import { AdminSelect, GhostButton, PrimaryButton } from "./ui";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PRESETS: Array<{ label: string; slots: string[]; wholeDay: boolean; dow?: number }> = [
  { label: "Weekday full-day", slots: ["07:30", "08:00"], wholeDay: true },
  { label: "Friday short", slots: ["07:00", "11:00", "15:00"], wholeDay: false, dow: 5 },
];

function formatHHMM12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Native time inputs may return HH:MM:SS; API slots are HH:MM. */
function normalizeHHMM(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
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
  const [newSlots, setNewSlots] = useState<string[]>(["07:30", "08:00"]);
  const [draftTime, setDraftTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const addDraftSlot = (raw: string) => {
    const time = normalizeHHMM(raw);
    if (!time) {
      setAddError("Time must be HH:MM (24-hour), e.g. 07:30 or 14:00.");
      return;
    }
    setAddError(null);
    setNewSlots((current) => (current.includes(time) ? current : [...current, time].sort()));
    setDraftTime("");
  };

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceId === "") return;
    setAddError(null);
    setAdding(true);
    try {
      if (newSlots.length === 0) throw new Error("Add at least one time slot.");
      await adminCreateServiceRule(
        { serviceId: Number(newServiceId), dayOfWeek: newDow, wholeDayLock: newWholeDay, slots: newSlots },
        { headers },
      );
      setNewSlots(["07:30", "08:00"]);
      setNewWholeDay(true);
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
    const normalized = normalizeHHMM(time);
    if (!normalized) {
      alert("Time must be HH:MM (24-hour), e.g. 07:30 or 14:00.");
      return;
    }
    try {
      await adminAddRuleSlot(rule.id, { time: normalized }, { headers });
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
    <section>
      <form
        onSubmit={addRule}
        className="grid grid-cols-1 gap-3 mb-5 p-4 rounded-2xl border border-white/10 bg-[#111111]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-1.5">
              Service
            </span>
            <AdminSelect
              value={newServiceId === "" ? "" : String(newServiceId)}
              onChange={(value) => setNewServiceId(value === "" ? "" : Number(value))}
              aria-label="Service"
              options={[
                { value: "", label: "Pick a service…" },
                ...(services ?? []).map((s: Service) => ({
                  value: String(s.id),
                  label: s.name,
                })),
              ]}
            />
          </label>
          <label className="block">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-1.5">
              Day
            </span>
            <AdminSelect
              value={String(newDow)}
              onChange={(value) => setNewDow(Number(value))}
              aria-label="Day of week"
              options={DOW_LABELS.map((label, i) => ({
                value: String(i),
                label: DOW_LONG[i],
                disabled: i === 0,
              }))}
            />
          </label>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-1.5">
            Times
          </span>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setNewSlots(preset.slots);
                  setNewWholeDay(preset.wholeDay);
                  if (preset.dow != null) setNewDow(preset.dow);
                }}
                className="min-h-11 px-3 rounded-xl border border-white/10 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:bg-white/5 touch-manipulation"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {newSlots.length === 0 && (
              <span className="text-xs text-[#9CA3AF] italic">No times yet — add one</span>
            )}
            {newSlots.map((time) => (
              <span
                key={time}
                className="inline-flex items-center gap-1 text-xs bg-white/[0.04] border border-white/10 rounded-full pl-3 pr-1 py-1 min-h-8"
              >
                <Clock className="w-3 h-3 text-[#23B9FF]" />
                {formatHHMM12h(time)}
                <button
                  type="button"
                  onClick={() => setNewSlots((current) => current.filter((slot) => slot !== time))}
                  className="p-1.5 rounded-full text-[#9CA3AF] hover:text-red-300 touch-manipulation"
                  title={`Remove ${time}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              aria-label="Add time slot"
              className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-2 text-sm text-white min-h-11 focus:border-[#FF2AD4] focus:outline-none"
            />
            <GhostButton
              type="button"
              className="h-11 px-3 text-xs"
              onClick={() => {
                if (!draftTime) return;
                addDraftSlot(draftTime);
              }}
              disabled={!draftTime}
            >
              + Add time
            </GhostButton>
          </div>
        </div>

        <label className="flex items-center gap-3 min-h-11 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={newWholeDay}
            onChange={(e) => setNewWholeDay(e.target.checked)}
            className="accent-[#FF2AD4] w-4 h-4"
          />
          <span>
            Whole-day lock
            <span className="block text-xs text-[#9CA3AF] font-normal">
              One booking on this day blocks every other service.
            </span>
          </span>
        </label>

        <PrimaryButton type="submit" disabled={newServiceId === "" || adding} className="w-full sm:w-auto">
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
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="font-bold text-white min-w-[72px]">{DOW_LONG[rule.dayOfWeek]}</div>
        <button
          type="button"
          onClick={onToggleLock}
          title={rule.wholeDayLock ? "One booking on this day blocks all other bookings of any service." : "Multiple bookings can coexist across the configured time slots."}
          className={`text-xs px-3 min-h-11 rounded-full border transition touch-manipulation ${
            rule.wholeDayLock ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {rule.wholeDayLock ? "Whole day" : "Per slot"}
        </button>
        <button
          type="button"
          onClick={onToggleActive}
          className={`text-xs px-3 min-h-11 rounded-full border transition touch-manipulation ${
            rule.active ? "bg-white/5 border-white/20 text-gray-300" : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {rule.active ? "Active" : "Paused"}
        </button>
        <div className="ml-auto">
          <button
            type="button"
            onClick={onDelete}
            className="p-2.5 min-h-11 min-w-11 rounded-lg text-[#9CA3AF] hover:text-red-300 hover:bg-red-500/10 touch-manipulation"
            title="Delete this rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {rule.slots.length === 0 && <span className="text-xs text-[#9CA3AF] italic">No times yet — add one →</span>}
        {rule.slots.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-white/[0.04] border border-white/10 rounded-full pl-3 pr-1 py-1 min-h-8">
            <Clock className="w-3 h-3 text-[#23B9FF]" />
            {formatHHMM12h(s.time)}
            <button
              type="button"
              onClick={() => onRemoveSlot(s.id)}
              className="p-1.5 rounded-full text-[#9CA3AF] hover:text-red-300 touch-manipulation"
              title={`Remove ${s.time}`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          aria-label={`Add time for ${DOW_LONG[rule.dayOfWeek]}`}
          className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-2 text-sm text-white min-h-11 focus:border-[#FF2AD4] focus:outline-none"
        />
        <GhostButton
          type="button"
          className="h-11 px-3 text-xs"
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
