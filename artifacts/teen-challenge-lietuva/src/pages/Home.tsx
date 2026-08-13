import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { FeatureBar } from "@/components/FeatureBar";
import { AboutSection } from "@/components/AboutSection";
import { ProgramsSection } from "@/components/ProgramsSection";
import { StoriesSection } from "@/components/StoriesSection";
import { DonationCTA } from "@/components/DonationCTA";
import { BibleVerse } from "@/components/BibleVerse";
import { NewsSection } from "@/components/NewsSection";
import { ContactSection } from "@/components/ContactSection";
import { useSeo } from "@/hooks/useSeo";
import { site } from "@/data/site";

export default function Home() {
  useSeo({
    title: undefined,
    description: site.description,
  });

  return (
    <Layout>
      <Hero />
      <FeatureBar />
      <AboutSection />
      <ProgramsSection />
      <StoriesSection />
      <DonationCTA />
      <BibleVerse />
      <NewsSection />
      <ContactSection />
    </Layout>
  );
}
