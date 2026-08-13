import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListBookings,
  adminCancelBooking,
  getAdminListBookingsQueryKey,
  useAdminListBlockedDates,
  getAdminListBlockedDatesQueryKey,
  useListServices,
  getListServicesQueryKey,
  type Booking,
  type BlockedDate,
  type Service,
} from "@workspace/api-client-react";
import { TOKEN_KEY } from "./constants";
import { parseAdminLocation } from "./utils";
import type { AdminSection } from "./constants";

type AdminContextValue = {
  token: string;
  section: AdminSection;
  routeId?: string;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  services: Service[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refetch: () => Promise<void>;
  isRefreshing: boolean;
  onLogout: () => void;
  cancelBooking: (id: number) => Promise<void>;
  startBooking: (id: number) => Promise<void>;
  startHold: (id: number) => Promise<void>;
  completeBooking: (id: number) => Promise<void>;
  sendReviewRequest: (id: number) => Promise<"sent" | "already">;
  skipReviewRequest: (id: number) => Promise<"skipped" | "already">;
  unskipReviewRequest: (id: number) => Promise<void>;
  editing: Booking | null;
  setEditing: (b: Booking | null) => void;
  detail: Booking | null;
  setDetail: (b: Booking | null) => void;
  blockOpen: boolean;
  blockPrefillDate: string;
  editingBlocked: BlockedDate | null;
  openBlockDate: (date?: string) => void;
  openEditBlockedDate: (row: BlockedDate) => void;
  closeBlockDate: () => void;
  readyTarget: Booking | null;
  readyResend: boolean;
  openReadyModal: (booking: Booking, resend?: boolean) => void;
  closeReadyModal: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({
  token,
  onLogout,
  children,
}: {
  token: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [location] = useLocation();
  const { section, id: routeId } = parseAdminLocation(location);
  const queryClient = useQueryClient();
  const headers = { "x-admin-token": token };

  const bookingsQuery = useAdminListBookings({
    request: { headers },
    query: { queryKey: getAdminListBookingsQueryKey(), retry: false, staleTime: 0 },
  });
  const blockedQuery = useAdminListBlockedDates({
    request: { headers },
    query: { queryKey: getAdminListBlockedDatesQueryKey(), retry: false, staleTime: 0 },
  });
  const servicesQuery = useListServices();

  useEffect(() => {
    const err = bookingsQuery.error;
    if (err && err instanceof Error && /401|Unauthorized/i.test(err.message)) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      onLogout();
    }
  }, [bookingsQuery.error, onLogout]);

  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockPrefillDate, setBlockPrefillDate] = useState("");
  const [editingBlocked, setEditingBlocked] = useState<BlockedDate | null>(null);
  const [readyTarget, setReadyTarget] = useState<Booking | null>(null);
  const [readyResend, setReadyResend] = useState(false);

  const bookings = bookingsQuery.data ?? [];
  const blockedDates = blockedQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  useEffect(() => {
    if (routeId && section === "appointments") {
      const found = bookings.find((b) => String(b.id) === routeId);
      if (found) setDetail(found);
      return;
    }
    if (!detail) return;
    const fresh = bookings.find((b) => b.id === detail.id);
    if (fresh) setDetail(fresh);
  }, [routeId, section, bookings, detail?.id]);

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: getAdminListBookingsQueryKey() }),
      queryClient.refetchQueries({ queryKey: getAdminListBlockedDatesQueryKey() }),
      queryClient.refetchQueries({ queryKey: getListServicesQueryKey() }),
      queryClient.refetchQueries({ queryKey: ["admin-booking-photos"] }),
      queryClient.refetchQueries({ queryKey: ["admin-calendar-events"] }),
    ]);
  }, [queryClient]);
  const isRefreshing = bookingsQuery.isFetching || blockedQuery.isFetching || servicesQuery.isFetching;

  const cancelBooking = useCallback(
    async (id: number) => {
      if (!confirm("Cancel this booking? The customer will not be notified automatically.")) {
        return;
      }
      try {
        await adminCancelBooking(id, { headers });
        refetch();
        setDetail((current) => (current?.id === id ? null : current));
      } catch (e) {
        alert(`Failed to cancel: ${e instanceof Error ? e.message : "unknown"}`);
      }
    },
    [headers, refetch],
  );

  const startBooking = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/bookings/${id}/in-progress`, {
          method: "POST",
          headers,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Could not start job (${res.status})`);
        }
        const json = await res.json();
        refetch();
        setDetail((current) => (current?.id === id ? json : current));
      } catch (e) {
        alert(`Could not start: ${e instanceof Error ? e.message : "unknown"}`);
      }
    },
    [headers, refetch],
  );

  const startHold = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/blocked-dates/${id}/start`, {
          method: "POST",
          headers,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Could not start job (${res.status})`);
        }
        const json = await res.json();
        refetch();
        setDetail(json);
      } catch (e) {
        alert(`Could not start: ${e instanceof Error ? e.message : "unknown"}`);
      }
    },
    [headers, refetch],
  );

  const completeBooking = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/admin/bookings/${id}/complete`, {
          method: "POST",
          headers,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Could not complete (${res.status})`);
        }
        const json = await res.json();
        refetch();
        setDetail((current) => (current?.id === id ? json : current));
      } catch (e) {
        alert(`Could not complete: ${e instanceof Error ? e.message : "unknown"}`);
      }
    },
    [headers, refetch],
  );

  const sendReviewRequest = useCallback(
    async (id: number) => {
      const res = await fetch(`/api/admin/bookings/${id}/review-request`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          json && typeof json === "object" && "message" in json && typeof json.message === "string"
            ? json.message
            : `Could not send review (${res.status})`;
        throw new Error(message);
      }
      const json = (await res.json()) as { alreadySent?: boolean; communications?: unknown };
      refetch();
      return json.alreadySent ? "already" : "sent";
    },
    [headers, refetch],
  );

  const skipReviewRequest = useCallback(
    async (id: number) => {
      const res = await fetch(`/api/admin/bookings/${id}/review-request/skip`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          json && typeof json === "object" && "message" in json && typeof json.message === "string"
            ? json.message
            : `Could not skip review (${res.status})`;
        throw new Error(message);
      }
      const json = (await res.json()) as { alreadySkipped?: boolean };
      refetch();
      return json.alreadySkipped ? "already" : "skipped";
    },
    [headers, refetch],
  );

  const unskipReviewRequest = useCallback(
    async (id: number) => {
      const res = await fetch(`/api/admin/bookings/${id}/review-request/unskip`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          json && typeof json === "object" && "message" in json && typeof json.message === "string"
            ? json.message
            : `Could not allow review (${res.status})`;
        throw new Error(message);
      }
      refetch();
    },
    [headers, refetch],
  );

  const openBlockDate = useCallback((date?: string) => {
    if (date) {
      const existing = blockedDates.find((row) => row.date === date);
      if (existing) {
        setEditingBlocked(existing);
        setBlockPrefillDate(existing.date);
        setBlockOpen(true);
        return;
      }
    }
    setEditingBlocked(null);
    setBlockPrefillDate(date ?? "");
    setBlockOpen(true);
  }, [blockedDates]);

  const openEditBlockedDate = useCallback((row: BlockedDate) => {
    setEditingBlocked(row);
    setBlockPrefillDate(row.date);
    setBlockOpen(true);
  }, []);

  const closeBlockDate = useCallback(() => {
    setBlockOpen(false);
    setBlockPrefillDate("");
    setEditingBlocked(null);
  }, []);

  const openReadyModal = useCallback((booking: Booking, resend = false) => {
    setReadyTarget(booking);
    setReadyResend(resend);
  }, []);

  const closeReadyModal = useCallback(() => {
    setReadyTarget(null);
    setReadyResend(false);
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      token,
      section,
      routeId,
      bookings,
      blockedDates,
      services,
      isLoading: bookingsQuery.isLoading,
      isRefreshing,
      searchQuery,
      setSearchQuery,
      refetch,
      onLogout: () => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // ignore
        }
        onLogout();
      },
      cancelBooking,
      startBooking,
      startHold,
      completeBooking,
      sendReviewRequest,
      skipReviewRequest,
      unskipReviewRequest,
      editing,
      setEditing,
      detail,
      setDetail,
      blockOpen,
      blockPrefillDate,
      editingBlocked,
      openBlockDate,
      openEditBlockedDate,
      closeBlockDate,
      readyTarget,
      readyResend,
      openReadyModal,
      closeReadyModal,
    }),
    [
      token,
      section,
      routeId,
      bookings,
      blockedDates,
      services,
      bookingsQuery.isLoading,
      isRefreshing,
      searchQuery,
      refetch,
      onLogout,
      cancelBooking,
      startBooking,
      startHold,
      completeBooking,
      sendReviewRequest,
      skipReviewRequest,
      unskipReviewRequest,
      editing,
      detail,
      blockOpen,
      blockPrefillDate,
      editingBlocked,
      openBlockDate,
      openEditBlockedDate,
      closeBlockDate,
      readyTarget,
      readyResend,
      openReadyModal,
      closeReadyModal,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
