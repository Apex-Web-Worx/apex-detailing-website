import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { StoriesSection } from "@/components/StoriesSection";
import { useSeo } from "@/hooks/useSeo";

export default function Stories() {
  useSeo({
    title: "Istorijos",
    description:
      "Laikini istorijų pavyzdžiai. Tikri liudijimai bus skelbiami tik gavus sutikimą.",
  });

  return (
    <Layout>
      <PageHero
        title="Istorijos"
        description="Tikros istorijos bus skelbiamos čia, kai bus patvirtintos ir gautas sutikimas."
        image="images/story-featured.jpg"
      />
      <StoriesSection />
    </Layout>
  );
}
