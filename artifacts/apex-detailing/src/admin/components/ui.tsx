import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayStatus } from "../utils";

export const fieldClass =
  "w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-base text-white placeholder:text-gray-500 focus:border-[#FF2AD4] focus:outline-none focus:ring-2 focus:ring-[#FF2AD4]/20 transition duration-200";

export type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function AdminSelect({
  value,
  onChange,
  options,
  className,
  compact = false,
  menuAlign = "left",
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  className?: string;
  compact?: boolean;
  menuAlign?: "left" | "right";
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          fieldClass,
          "flex items-center justify-between gap-2 text-left",
          compact && "h-10 py-0 text-sm",
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-40 mt-1 max-h-60 min-w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111111] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.65)]",
            compact && "w-max max-w-[min(18rem,calc(100vw-1.5rem))]",
            menuAlign === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value || option.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 text-sm transition duration-150",
                    option.disabled && "opacity-40 cursor-not-allowed",
                    isActive
                      ? "bg-[#FF2AD4]/20 text-white"
                      : "text-white hover:bg-white/[0.08]",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, string> = {
    confirmed: "bg-[#FF2AD4]/15 text-[#FF2AD4] border-[#FF2AD4]/30",
    in_progress: "bg-[#23B9FF]/15 text-[#23B9FF] border-[#23B9FF]/30",
    ready_for_pickup: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    completed: "bg-white/5 text-gray-400 border-white/10",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/25",
  };
  const label: Record<DisplayStatus, string> = {
    confirmed: "CONFIRMED",
    in_progress: "IN PROGRESS",
    ready_for_pickup: "READY FOR PICKUP",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] whitespace-nowrap",
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
        "inline-flex items-center justify-center gap-2 min-h-11 h-11 px-4 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold transition duration-200 hover:bg-[#ff4adc] hover:shadow-[0_0_16px_rgba(255,42,212,0.28)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none touch-manipulation",
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
        "inline-flex items-center justify-center gap-2 min-h-11 h-11 px-4 rounded-xl border border-white/10 bg-transparent text-sm font-medium text-white transition duration-200 hover:bg-white/5 hover:border-white/20 disabled:opacity-40 touch-manipulation",
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
