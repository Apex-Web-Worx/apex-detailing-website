import { Layout } from "@/components/Layout";
import { Button } from "@/components/Button";
import { useSeo } from "@/hooks/useSeo";

export default function NotFound() {
  useSeo({
    title: "Puslapis nerastas",
    description: "Šio puslapio nėra. Grįžkite į Teen Challenge Lietuva pradžią.",
  });

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-gold-dark">
          404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-navy">Puslapis nerastas</h1>
        <p className="mt-4 text-muted">
          Šio adreso svetainėje nėra. Galite grįžti į pradžią arba susisiekti su mumis.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/" variant="navy">
            Į pradžią
          </Button>
          <Button href="/kontaktai" variant="gold">
            Kontaktai
          </Button>
        </div>
      </section>
    </Layout>
  );
}
