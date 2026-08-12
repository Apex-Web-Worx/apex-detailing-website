import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  Users,
  Car,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react";

export const TOKEN_KEY = "apex_admin_token";
export const SHOP_TZ = "America/Chicago";
export const ADMIN_NAME = "Michail Gurov";
export const ADMIN_FIRST = "Michail";
export const ADMIN_ROLE = "Admin";

export type AdminSection =
  | "dashboard"
  | "appointments"
  | "calendar"
  | "customers"
  | "vehicles"
  | "services"
  | "payments"
  | "reviews"
  | "messages"
  | "analytics"
  | "settings";

export type NavItem = {
  href: string;
  section: AdminSection;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", section: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", section: "appointments", label: "Appointments", icon: CalendarClock },
  { href: "/admin/calendar", section: "calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/customers", section: "customers", label: "Customers", icon: Users },
  { href: "/admin/vehicles", section: "vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/services", section: "services", label: "Services", icon: Sparkles },
  { href: "/admin/analytics", section: "analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", section: "settings", label: "Settings", icon: Settings },
];

export const PAGE_TITLES: Record<AdminSection, string> = {
  dashboard: "Dashboard",
  appointments: "Appointments",
  calendar: "Calendar",
  customers: "Customers",
  vehicles: "Vehicles",
  services: "Services",
  payments: "Payments",
  reviews: "Reviews",
  messages: "Messages",
  analytics: "Analytics",
  settings: "Settings",
};
