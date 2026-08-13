import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-all duration-300",
        scrolled
          ? "border-line/80 shadow-[0_8px_24px_rgba(7,59,120,0.08)]"
          : "border-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-hidden px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "h-16" : "h-[4.5rem]",
        )}
      >
        <Logo compact={scrolled} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Pagrindinė navigacija">
          {mainNav.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "text-navy"
                    : "text-muted hover:text-navy",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/parama"
            className="group hidden items-center gap-2 rounded-[12px] bg-gold px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-navy shadow-[0_8px_20px_rgba(249,185,22,0.25)] transition duration-200 hover:scale-[1.02] hover:bg-gold-dark sm:inline-flex"
          >
            <Heart className="size-4 fill-current" aria-hidden="true" />
            Parama
          </Link>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[12px] border border-line text-navy lg:hidden"
            aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-line bg-white lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobilioji navigacija">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[12px] px-4 py-3 text-base font-bold text-navy hover:bg-canvas"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/parama"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-[12px] bg-gold px-4 py-3.5 text-base font-extrabold uppercase tracking-wide text-navy"
          >
            <Heart className="size-5 fill-current" aria-hidden="true" />
            Parama
          </Link>
        </nav>
      </div>
    </header>
  );
}
