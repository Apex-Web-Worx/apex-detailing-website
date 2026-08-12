import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DisplayStatus } from "../utils";

export const fieldClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF2AD4] focus:outline-none focus:ring-2 focus:ring-[#FF2AD4]/20 transition duration-200";

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, string> = {
    confirmed: "bg-[#FF2AD4]/15 text-[#FF2AD4] border-[#FF2AD4]/30",
    completed: "bg-white/5 text-gray-400 border-white/10",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/25",
  };
  const label: Record<DisplayStatus, string> = {
    confirmed: "CONFIRMED",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em]",
        map[status],
      )}
    >
      {label[status]}
    </span>
  );
}

export function AdminCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#111111] transition duration-200",
        hover && "hover:bg-[#161616] hover:border-white/15 hover:-translate-y-px",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold transition duration-200 hover:bg-[#ff4adc] hover:shadow-[0_0_16px_rgba(255,42,212,0.28)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-white/10 bg-transparent text-sm font-medium text-white transition duration-200 hover:bg-white/5 hover:border-white/20 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const id = "apex-spark";
  if (values.length < 2) {
    return <div className={cn("h-14", className)} />;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 280;
  const h = 56;
  const pad = 4;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full h-14", className)} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF2AD4" />
          <stop offset="50%" stopColor="#8A52FF" />
          <stop offset="100%" stopColor="#23B9FF" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AdminCard hover={false} className="p-10 text-center">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-sm text-[#9CA3AF] mt-2 max-w-md mx-auto">{body}</p>
    </AdminCard>
  );
}
