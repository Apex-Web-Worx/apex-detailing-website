import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { news } from "@/data/news";
import { useSeo } from "@/hooks/useSeo";
import { asset, formatDateLt } from "@/lib/utils";

export default function News() {
  useSeo({
    title: "Naujienos",
    description: "Teen Challenge Lietuva naujienos. Šie įrašai yra laikini pavyzdžiai.",
  });

  return (
    <Layout>
      <PageHero
        title="Naujienos"
        description="Šie įrašai yra laikinas turinio pavyzdys ir bus pakeisti tikromis naujienomis."
        image="images/news-1.jpg"
      />
      <section className="bg-canvas py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {news.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-[16px] bg-white shadow-[0_16px_40px_rgba(7,59,120,0.08)]"
            >
              <img
                src={asset(article.image)}
                alt={article.imageAlt}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                  <time dateTime={article.date}>{formatDateLt(article.date)}</time>
                  <span className="mx-2 text-gold">•</span>
                  {article.category}
                </p>
                <h2 className="mt-3 text-xl font-extrabold text-navy">{article.title}</h2>
                <p className="mt-3 text-sm text-muted">{article.excerpt}</p>
                <Link
                  href={article.href}
                  className="mt-5 inline-block text-sm font-extrabold uppercase tracking-wide text-navy"
                >
                  Skaityti →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
