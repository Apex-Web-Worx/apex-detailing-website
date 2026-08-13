import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { FadeIn } from "@/components/FadeIn";
import { SectionHeading } from "@/components/SectionHeading";
import { contact } from "@/data/site";

export function ContactSection({ heading = "Susisiekime" }: { heading?: string }) {
  return (
    <section className="bg-white py-20 md:py-28" id="kontaktai">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <FadeIn>
          <SectionHeading title={heading} />
          <p className="mt-5 max-w-md text-muted">
            Kontaktiniai duomenys bus patikslinti. Žemiau palikti aiškūs laukai,
            kuriuos vėliau galima pakeisti vienoje vietoje – faile
            <span className="font-semibold text-navy"> src/data/site.ts</span>.
          </p>
          <ul className="mt-8 space-y-5">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 text-gold" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  Telefonas
                </p>
                {contact.phoneHref ? (
                  <a href={contact.phoneHref} className="font-bold text-navy">
                    {contact.phoneDisplay}
                  </a>
                ) : (
                  <p className="font-bold text-navy">{contact.phoneDisplay}</p>
                )}
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 text-gold" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  El. paštas
                </p>
                {contact.emailHref ? (
                  <a href={contact.emailHref} className="font-bold text-navy">
                    {contact.emailDisplay}
                  </a>
                ) : (
                  <p className="font-bold text-navy">{contact.emailDisplay}</p>
                )}
              </div>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 text-gold" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  Adresas
                </p>
                {contact.addressLines.map((line) => (
                  <p key={line} className="font-bold text-navy">
                    {line}
                  </p>
                ))}
              </div>
            </li>
          </ul>
          <div className="mt-8 flex gap-3">
            <SocialPlaceholder label="Facebook" icon={Facebook} />
            <SocialPlaceholder label="Instagram" icon={Instagram} />
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="rounded-[16px] border border-line bg-canvas p-6 shadow-[0_16px_40px_rgba(7,59,120,0.06)] md:p-8">
            <ContactForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function SocialPlaceholder({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Facebook;
}) {
  return (
    <span
      className="inline-flex size-11 items-center justify-center rounded-full border border-line text-navy"
      title={`${label} nuoroda bus pridėta vėliau`}
      aria-label={`${label} – nuoroda bus pridėta vėliau`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}
