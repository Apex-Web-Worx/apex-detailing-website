import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { getFeaturedStory, stories } from "@/data/stories";
import { asset } from "@/lib/utils";

export function StoriesSection() {
  const featured = getFeaturedStory();
  const others = stories.filter((story) => story.id !== featured.id);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-extrabold leading-tight text-navy md:text-4xl lg:text-[2.75rem]">
            Tikros istorijos.
            <span className="block">Tikri gyvenimai.</span>
          </h2>
          <span className="mt-5 block h-[3px] w-16 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Šios istorijos yra laikinas turinio pavyzdys ir nėra tikrų žmonių
            liudijimai.
          </p>
        </FadeIn>

        <FadeIn>
          <article className="mt-12 grid overflow-hidden rounded-[16px] bg-navy text-white shadow-[0_24px_50px_rgba(7,59,120,0.16)] lg:grid-cols-2">
            <div className="group overflow-hidden">
              <img
                src={asset(featured.image)}
                alt={featured.imageAlt}
                className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 lg:h-full"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="text-6xl font-extrabold leading-none text-gold" aria-hidden="true">
                “
              </span>
              <blockquote className="mt-2 text-2xl font-bold leading-snug md:text-[1.85rem]">
                {featured.quote}
              </blockquote>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                {featured.attribution}
              </p>
              <Link
                href={featured.href}
                className="group mt-8 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gold"
              >
                Skaityti istoriją
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </FadeIn>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((story, index) => (
            <FadeIn key={story.id} delay={index * 80}>
              <article className="flex h-full flex-col rounded-[16px] border border-line bg-canvas p-7 shadow-[0_10px_30px_rgba(7,59,120,0.05)] transition duration-300 hover:-translate-y-1">
                <span className="text-5xl font-extrabold leading-none text-gold" aria-hidden="true">
                  “
                </span>
                <blockquote className="mt-2 text-lg font-bold leading-snug text-navy">
                  {story.quote}
                </blockquote>
                <p className="mt-4 text-sm text-muted">{story.preview}</p>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  {story.attribution}
                </p>
                <Link
                  href={story.href}
                  className="group mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold uppercase tracking-wide text-navy"
                >
                  Skaityti istoriją
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
