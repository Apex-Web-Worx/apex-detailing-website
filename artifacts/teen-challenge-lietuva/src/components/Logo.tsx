import { Link } from "wouter";
import { asset, cn } from "@/lib/utils";
import { site } from "@/data/site";

type LogoProps = {
  compact?: boolean;
  onDark?: boolean;
  className?: string;
};

export function Logo({ compact = false, onDark = false, className }: LogoProps) {
  const markSize = onDark
    ? "h-14 w-14"
    : compact
      ? "h-10 w-10"
      : "h-11 w-11";

  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-[10px] focus-visible:outline-offset-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden bg-white",
          markSize,
          onDark ? "rounded-[10px] p-1 shadow-sm" : "rounded-md",
        )}
      >
        <img
          src={asset("images/logo-nav.png")}
          alt=""
          width={56}
          height={56}
          className="h-full w-full object-contain object-center"
        />
      </span>
      <span className="hidden min-[380px]:block">
        <span
          className={cn(
            "block whitespace-nowrap text-[0.68rem] font-extrabold uppercase leading-none tracking-[0.12em] sm:text-xs",
            onDark ? "text-gold" : "text-navy",
          )}
        >
          Teen Challenge
        </span>
        <span
          className={cn(
            "mt-1 block text-base font-extrabold leading-none",
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
