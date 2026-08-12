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
  refetch: () => void;
  onLogout: () => void;
  cancelBooking: (id: number) => Promise<void>;
  editing: Booking | null;
  setEditing: (b: Booking | null) => void;
  detail: Booking | null;
  setDetail: (b: Booking | null) => void;
  blockOpen: boolean;
  blockPrefillDate: string;
  openBlockDate: (date?: string) => void;
  closeBlockDate: () => void;
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
    query: { queryKey: getAdminListBookingsQueryKey(), retry: false },
  });
  const blockedQuery = useAdminListBlockedDates({
    request: { headers },
    query: { queryKey: getAdminListBlockedDatesQueryKey(), retry: false },
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

  const bookings = bookingsQuery.data ?? [];
  const blockedDates = blockedQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  useEffect(() => {
    if (!routeId || section !== "appointments") return;
    const found = bookings.find((b) => String(b.id) === routeId);
    if (found) setDetail(found);
  }, [routeId, section, bookings]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getAdminListBookingsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminListBlockedDatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: ["admin-booking-photos"] });
  }, [queryClient]);

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

  const openBlockDate = useCallback((date?: string) => {
    setBlockPrefillDate(date ?? "");
    setBlockOpen(true);
  }, []);

  const closeBlockDate = useCallback(() => {
    setBlockOpen(false);
    setBlockPrefillDate("");
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
      editing,
      setEditing,
      detail,
      setDetail,
      blockOpen,
      blockPrefillDate,
      openBlockDate,
      closeBlockDate,
    }),
    [
      token,
      section,
      routeId,
      bookings,
      blockedDates,
      services,
      bookingsQuery.isLoading,
      searchQuery,
      refetch,
      onLogout,
      cancelBooking,
      editing,
      detail,
      blockOpen,
      blockPrefillDate,
      openBlockDate,
      closeBlockDate,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
