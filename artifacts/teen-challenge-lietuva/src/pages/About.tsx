import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { aboutContent } from "@/data/about";
import { useSeo } from "@/hooks/useSeo";
import { asset } from "@/lib/utils";

export default function About() {
  useSeo({
    title: "Apie mus",
    description:
      "Teen Challenge Lietuva – krikščioniška pagalba, viltis ir nauja gyvenimo kryptis. Informacija bus patikslinta.",
  });

  return (
    <Layout>
      <PageHero
        title="Apie mus"
        description="Kas mes esame ir kodėl ši pagalba svarbi."
        image="images/about.jpg"
      />
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="yellow-underline text-3xl font-extrabold text-navy">
              {aboutContent.title}
            </h2>
            <div className="mt-8 space-y-4 text-muted">
              {aboutContent.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/musu-veikla" variant="navy">
                Mūsų veikla
              </Button>
              <Button href="/kontaktai" variant="gold">
                Susisiekti
              </Button>
            </div>
          </div>
          <img
            src={asset(aboutContent.image)}
            alt={aboutContent.imageAlt}
            className="w-full rounded-[16px] object-cover shadow-[0_24px_50px_rgba(7,59,120,0.12)]"
          />
        </div>
      </section>
    </Layout>
  );
}
