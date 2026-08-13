import { Redirect, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { getStoryBySlug } from "@/data/stories";
import { useSeo } from "@/hooks/useSeo";

export default function StoryDetail() {
  const params = useParams<{ slug: string }>();
  const story = getStoryBySlug(params.slug ?? "");

  useSeo({
    title: story ? "Istorija" : "Istorija nerasta",
    description: story?.preview,
  });

  if (!story) {
    return <Redirect to="/istorijos" />;
  }

  return (
    <Layout>
      <PageHero title="Istorija" description={story.attribution} image={story.image} />
      <section className="bg-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <span className="text-6xl font-extrabold leading-none text-gold" aria-hidden="true">
            “
          </span>
          <blockquote className="text-3xl font-extrabold leading-tight text-navy">
            {story.quote}
          </blockquote>
          <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.16em] text-muted">
            {story.attribution}
          </p>
          <div className="mt-10 space-y-4 text-lg text-muted">
            {story.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10">
            <Button href="/istorijos" variant="navy">
              Visos istorijos
            </Button>
          </div>
        </article>
      </section>
    </Layout>
  );
}
