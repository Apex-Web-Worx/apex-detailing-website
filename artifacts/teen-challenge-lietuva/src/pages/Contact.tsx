import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ContactSection } from "@/components/ContactSection";
import { useSeo } from "@/hooks/useSeo";

export default function Contact() {
  useSeo({
    title: "Kontaktai",
    description:
      "Susisiekite su Teen Challenge Lietuva. Kontaktiniai duomenys bus patikslinti.",
  });

  return (
    <Layout>
      <PageHero
        title="Kontaktai"
        description="Palikite žinutę – kontaktiniai duomenys bus patikslinti oficialioje informacijoje."
        image="images/help.jpg"
      />
      <ContactSection />
    </Layout>
  );
}
