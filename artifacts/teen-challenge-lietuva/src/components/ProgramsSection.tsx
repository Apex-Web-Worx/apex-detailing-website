import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { SectionHeading } from "@/components/SectionHeading";
import { programs } from "@/data/programs";
import { asset } from "@/lib/utils";

type ProgramsSectionProps = {
  showIntro?: boolean;
};

export function ProgramsSection({ showIntro = true }: ProgramsSectionProps) {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showIntro ? (
          <FadeIn>
            <SectionHeading
              title="Mūsų veikla"
              description="Pagalba prasideda nuo žmogaus, bet pokytis keičia visą gyvenimą."
            />
          </FadeIn>
        ) : null}

        <div className={`grid gap-6 md:grid-cols-2 ${showIntro ? "mt-12" : ""}`}>
          {programs.map((program, index) => (
            <FadeIn key={program.id} delay={index * 80}>
              <Link
                href={program.href}
                className="group grid overflow-hidden rounded-[16px] bg-white shadow-[0_16px_40px_rgba(7,59,120,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(7,59,120,0.14)] sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="overflow-hidden">
                  <img
                    src={asset(program.image)}
                    alt={program.imageAlt}
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-full"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-gold-dark">
                    {program.number}
                  </p>
                  <h3 className="mt-3 text-xl font-extrabold leading-snug text-navy">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {program.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-navy">
                    Sužinoti daugiau
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
