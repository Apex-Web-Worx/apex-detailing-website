import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ProgramsSection } from "@/components/ProgramsSection";
import { useSeo } from "@/hooks/useSeo";

export default function Programs() {
  useSeo({
    title: "Mūsų veikla",
    description:
      "Teen Challenge Lietuva programos ir pagalbos kelias. Informacija bus patikslinta.",
  });

  return (
    <Layout>
      <PageHero
        title="Mūsų veikla"
        description="Pagalba prasideda nuo žmogaus, bet pokytis keičia visą gyvenimą."
        image="images/community.jpg"
      />
      <ProgramsSection showIntro={false} />
    </Layout>
  );
}
