import { Link } from "wouter";
import { Facebook, Heart, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";
import { legalNav, mainNav } from "@/data/navigation";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo onDark />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            Krikščioniška viltis, pagalba ir nauja gyvenimo kryptis. Šis
            aprašymas yra laikinas ir turi būti patvirtintas pagal oficialią
            organizacijos informaciją.
          </p>
          <Link
            href="/parama"
            className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-gold px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-navy"
          >
            <Heart className="size-4 fill-current" aria-hidden="true" />
            Parama
          </Link>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Navigacija
          </h2>
          <ul className="mt-4 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Sekite mus
          </h2>
          <div className="mt-4 flex gap-3">
            <SocialIcon label="Facebook" icon={Facebook} />
            <SocialIcon label="Instagram" icon={Instagram} />
            <SocialIcon label="YouTube" icon={Youtube} />
          </div>
          <p className="mt-4 text-sm text-white/55">
            Socialinių tinklų nuorodos bus pridėtos, kai bus patvirtintos.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {site.year} {site.name}. Visos teisės saugomos.
          </p>
          <div className="flex flex-wrap gap-4">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Facebook;
}) {
  return (
    <span
      className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white"
      aria-label={`${label} – nuoroda bus pridėta vėliau`}
      title={`${label} nuoroda bus pridėta vėliau`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}
