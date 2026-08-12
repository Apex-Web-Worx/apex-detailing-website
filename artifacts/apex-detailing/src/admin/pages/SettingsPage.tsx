import { Link } from "wouter";
import { AdminPwaInstallHint } from "@/components/PwaManifestSwitch";
import { ADMIN_NAME, ADMIN_ROLE } from "../constants";
import { useAdmin } from "../context";
import { formatDateLong, todayDateString } from "@/lib/format";
import { GhostButton, PrimaryButton, AdminCard } from "../components/ui";
import { adminUnblockDate, getAdminListBlockedDatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { onLogout, blockedDates, token, openBlockDate, openEditBlockedDate } = useAdmin();
  const queryClient = useQueryClient();
  const today = todayDateString();
  const upcoming = blockedDates.filter((b) => b.date >= today);

  const unblock = async (date: string) => {
    if (!confirm(`Re-open ${formatDateLong(date)}? Customers will be able to book it again.`)) return;
    try {
      await adminUnblockDate(date, { headers: { "x-admin-token": token } });
      queryClient.invalidateQueries({ queryKey: getAdminListBlockedDatesQueryKey() });
    } catch (e) {
      alert(`Could not re-open: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Settings</h2>
      <AdminCard hover={false} className="p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-bold">MG</div>
        <div>
          <p className="font-semibold">{ADMIN_NAME}</p>
          <p className="text-sm text-[#9CA3AF]">{ADMIN_ROLE}</p>
        </div>
      </AdminCard>
      <AdminPwaInstallHint />
      <AdminCard hover={false} className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-bold">Blocked dates</h3>
          <GhostButton type="button" className="h-8 px-3 text-xs" onClick={() => openBlockDate()}>
            + Block Date
          </GhostButton>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No upcoming blocked days. Sundays are already closed.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {formatDateLong(b.date)}
                  {b.reason ? ` · ${b.reason}` : ""}
                  {(b.name || b.phone) ? (
                    <span className="block text-xs text-[#9CA3AF]">
                      {[b.name, b.surname].filter(Boolean).join(" ")}
                      {b.phone ? ` ${b.phone}` : ""}
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    className="text-[#23B9FF] text-xs"
                    onClick={() => openEditBlockedDate(b)}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-red-400 text-xs" onClick={() => unblock(b.date)}>
                    Re-open
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      <div className="flex flex-wrap gap-2">
        <Link href="/">
          <GhostButton type="button">Back to site</GhostButton>
        </Link>
        <PrimaryButton type="button" onClick={onLogout}>Sign out</PrimaryButton>
      </div>
    </div>
  );
}
