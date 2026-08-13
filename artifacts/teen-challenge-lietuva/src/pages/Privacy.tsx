import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

export default function Privacy() {
  useSeo({
    title: "Privatumo politika",
    description: "Teen Challenge Lietuva privatumo politikos projektas. Tekstas bus patikslintas teisiškai.",
  });

  return (
    <Layout>
      <PageHero title="Privatumo politika" />
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-muted sm:px-6">
          <p>
            Šis puslapis yra laikinas teisinio teksto karkasas. Jį būtina peržiūrėti
            ir pakeisti pagal tikrą {site.name} duomenų tvarkymo praktiką.
          </p>
          <h2 className="text-xl font-extrabold text-navy">Kokius duomenis renkame</h2>
          <p>
            Kontaktų formoje galime gauti vardą, el. paštą ir žinutės turinį. Kol
            forma nesiunčia laiškų, šie duomenys nėra perduodami trečiosioms
            šalims per šią svetainę.
          </p>
          <h2 className="text-xl font-extrabold text-navy">Kam jie naudojami</h2>
          <p>
            Kai bus prijungtas laiškų siuntimas, duomenys bus naudojami tik
            atsakymui į užklausą. Tikslesnė politika bus paskelbta po teisinės
            peržiūros.
          </p>
        </div>
      </section>
    </Layout>
  );
}
