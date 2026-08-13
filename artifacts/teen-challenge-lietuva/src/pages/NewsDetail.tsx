import { Redirect, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { getNewsBySlug } from "@/data/news";
import { useSeo } from "@/hooks/useSeo";
import { formatDateLt } from "@/lib/utils";

export default function NewsDetail() {
  const params = useParams<{ slug: string }>();
  const article = getNewsBySlug(params.slug ?? "");

  useSeo({
    title: article?.title ?? "Naujiena",
    description: article?.excerpt,
  });

  if (!article) {
    return <Redirect to="/naujienos" />;
  }

  return (
    <Layout>
      <PageHero title={article.title} image={article.image} />
      <section className="bg-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            <time dateTime={article.date}>{formatDateLt(article.date)}</time>
            <span className="mx-2 text-gold">•</span>
            {article.category}
          </p>
          <div className="mt-8 space-y-4 text-lg text-muted">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10">
            <Button href="/naujienos" variant="navy">
              Visos naujienos
            </Button>
          </div>
        </article>
      </section>
    </Layout>
  );
}
