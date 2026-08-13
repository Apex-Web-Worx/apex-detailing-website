import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { helpContent } from "@/data/about";
import { useSeo } from "@/hooks/useSeo";

export default function Help() {
  useSeo({
    title: "Pagalba",
    description:
      "Ieškote pagalbos sau arba artimam žmogui? Susisiekite su Teen Challenge Lietuva.",
  });

  return (
    <Layout>
      <PageHero
        title="Pagalba"
        description={helpContent.intro}
        image="images/help.jpg"
      />
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="yellow-underline text-3xl font-extrabold text-navy">
              {helpContent.title}
            </h2>
            <ol className="mt-10 space-y-6">
              {helpContent.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-navy">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-navy">{step.title}</h3>
                    <p className="mt-1 text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-10 rounded-[14px] bg-canvas p-5 text-sm text-muted">
              Jei kyla pavojus gyvybei ar sveikatai, skambinkite skubios pagalbos
              numeriu <span className="font-bold text-navy">112</span>.
            </p>
            <div className="mt-8">
              <Button href="/kontaktai" variant="navy">
                Kontaktai
              </Button>
            </div>
          </div>
          <div className="rounded-[16px] border border-line bg-canvas p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-navy">Parašykite mums</h2>
            <p className="mt-2 mb-6 text-sm text-muted">
              Forma dar nesiunčia laiškų. Ji paruošta vėlesniam EmailJS / Resend
              ar serverio prijungimui.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </Layout>
  );
}
