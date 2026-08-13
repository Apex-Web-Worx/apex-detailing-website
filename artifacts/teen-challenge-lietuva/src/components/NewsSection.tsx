import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { FadeIn } from "@/components/FadeIn";
import { SectionHeading } from "@/components/SectionHeading";
import { news } from "@/data/news";
import { asset, formatDateLt } from "@/lib/utils";

export function NewsSection() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading title="Naujienos" />
            <Link
              href="/naujienos"
              className="group inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-navy"
            >
              Visos naujienos
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {news.map((article, index) => (
            <FadeIn key={article.id} delay={index * 80}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_16px_40px_rgba(7,59,120,0.08)] transition duration-300 hover:-translate-y-1">
                <div className="overflow-hidden">
                  <img
                    src={asset(article.image)}
                    alt={article.imageAlt}
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                    <time dateTime={article.date}>{formatDateLt(article.date)}</time>
                    <span className="mx-2 text-gold">•</span>
                    {article.category}
                  </p>
                  <h3 className="mt-3 text-xl font-extrabold leading-snug text-navy">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {article.excerpt}
                  </p>
                  <Link
                    href={article.href}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold uppercase tracking-wide text-navy"
                  >
                    Skaityti
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
