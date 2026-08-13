import { Link } from "wouter";
import { asset, cn } from "@/lib/utils";
import { site } from "@/data/site";

type LogoProps = {
  compact?: boolean;
  onDark?: boolean;
  className?: string;
};

export function Logo({ compact = false, onDark = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-[10px] focus-visible:outline-offset-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden bg-white",
          onDark ? "rounded-[12px] p-1.5 shadow-sm" : "rounded-md",
        )}
      >
        <img
          src={asset("images/logo-nav.png")}
          alt=""
          className={cn(
            "w-auto object-contain transition-all duration-300",
            compact ? "h-10 md:h-11" : "h-12 md:h-[3.35rem]",
          )}
        />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-[0.7rem] font-extrabold uppercase leading-none tracking-[0.16em] md:text-xs",
            onDark ? "text-gold" : "text-navy",
          )}
        >
          Teen Challenge
        </span>
        <span
          className={cn(
            "mt-1 block truncate text-base font-extrabold leading-none md:text-lg",
            onDark ? "text-white" : "text-navy",
          )}
        >
          Lietuva
        </span>
      </span>
      <span className="sr-only">{site.name}, pradžia</span>
    </Link>
  );
}
