import { Button } from "@/components/Button";
import { FadeIn } from "@/components/FadeIn";
import { aboutContent } from "@/data/about";
import { asset } from "@/lib/utils";

export function AboutSection() {
  return (
    <section className="bg-white py-20 md:py-28" id="apie">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <FadeIn>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-navy">
            {aboutContent.eyebrow}
          </p>
          <h2 className="yellow-underline mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
            {aboutContent.title}
          </h2>
          <div className="mt-8 space-y-4 text-muted">
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8">
            <Button href="/apie-mus" variant="navy" arrow>
              Apie mus
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="group overflow-hidden rounded-[16px] shadow-[0_24px_50px_rgba(7,59,120,0.12)]">
            <img
              src={asset(aboutContent.image)}
              alt={aboutContent.imageAlt}
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
