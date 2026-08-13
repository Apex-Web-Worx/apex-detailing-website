import { FadeIn } from "@/components/FadeIn";
import { bibleVerse } from "@/data/verse";
import { asset } from "@/lib/utils";

export function BibleVerse() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-32">
      <img
        src={asset(bibleVerse.image)}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-navy-dark/78" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <FadeIn>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
            Šventasis Raštas
          </p>
          <blockquote className="mt-6 text-2xl font-bold leading-snug text-white md:text-[2rem]">
            „{bibleVerse.text}“
          </blockquote>
          <cite className="mt-6 block text-sm font-semibold not-italic uppercase tracking-[0.18em] text-white/70">
            {bibleVerse.reference}
          </cite>
        </FadeIn>
      </div>
    </section>
  );
}
