import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { useSeo } from "@/hooks/useSeo";

export default function Cookies() {
  useSeo({
    title: "Slapukų politika",
    description: "Teen Challenge Lietuva slapukų politikos projektas.",
  });

  return (
    <Layout>
      <PageHero title="Slapukų politika" />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-muted sm:px-6">
          <p>
            Šis puslapis yra laikinas. Šiuo metu svetainė nenaudoja rinkodaros
            slapukų. Jei vėliau bus įjungta analitika, čia reikės nurodyti
            slapukų tipus, trukmę ir sutikimo tvarką.
          </p>
          <h2 className="text-xl font-extrabold text-navy">Būtinieji slapukai</h2>
          <p>
            Naršyklė gali išsaugoti techninius duomenis, reikalingus svetainei
            veikti. Tai nėra skirta reklamai.
          </p>
        </div>
      </section>
    </Layout>
  );
}
