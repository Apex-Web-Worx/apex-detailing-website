import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  gold:
    "bg-gold text-navy hover:bg-gold-dark shadow-[0_8px_24px_rgba(249,185,22,0.28)]",
  navy: "bg-navy text-white hover:bg-navy-dark",
  outline:
    "border border-white/70 bg-white/10 text-white hover:bg-white hover:text-navy",
  ghost: "bg-transparent text-navy hover:bg-navy/5",
  white: "bg-white text-navy hover:bg-canvas",
};

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  arrow?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-sm font-extrabold tracking-wide uppercase transition duration-200 hover:scale-[1.02] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60";

export function Button({
  href,
  children,
  variant = "gold",
  arrow = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(baseClass, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow ? (
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (isExternal) {
      return (
        <a href={href} className={cn("group", classes)}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cn("group", classes)}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={cn("group", classes)} {...props}>
      {content}
    </button>
  );
}
