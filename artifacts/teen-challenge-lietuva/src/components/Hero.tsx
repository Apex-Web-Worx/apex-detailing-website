import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/Button";
import { asset } from "@/lib/utils";

export function Hero() {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVideoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [videoOpen]);

  return (
    <section className="relative isolate min-h-[560px] overflow-hidden md:min-h-[680px] md:h-[72vh] md:max-h-[750px]">
      <img
        src={asset("images/hero.jpg")}
        alt="Žmogus, stovintis ant kalno ir žvelgiantis į saulėtekį – vilties ir naujos pradžios iliustracija"
        className="absolute inset-0 size-full object-cover object-[center_45%]"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy/70 to-navy-dark/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy-dark/55 via-transparent to-navy-dark/20"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 md:min-h-[680px] lg:px-8">
        <div className="max-w-2xl text-white">
          <p className="hero-fade text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
            Teen Challenge Lietuva
          </p>
          <h1 className="hero-fade hero-fade-delay-1 mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Keičiame gyvenimus.
            <span className="mt-2 block">Teikiame viltį.</span>
          </h1>
          <p className="hero-fade hero-fade-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-white/88">
            Padedame žmonėms įveikti priklausomybes, atrasti laisvę ir kurti naują
            gyvenimo kryptį.
          </p>
          <p className="hero-fade hero-fade-delay-2 mt-3 text-sm text-white/55">
            Šis tekstas yra laikinas, kol bus patvirtinta oficiali organizacijos žinutė.
          </p>
          <div className="hero-fade hero-fade-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/apie-mus" variant="white">
              Sužinoti daugiau
            </Button>
            <Button variant="outline" onClick={() => setVideoOpen(true)}>
              <Play className="size-4 fill-current" aria-hidden="true" />
              Pažiūrėti video
            </Button>
            <Button href="/parama" arrow>
              Paremti mūsų veiklą
            </Button>
          </div>
        </div>
      </div>

      {videoOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-dark/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-title"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-[16px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="video-title" className="text-xl font-extrabold text-navy">
              Vaizdo įrašas
            </h2>
            <p className="mt-3 text-muted">
              Vaizdo įrašas bus paskelbtas netrukus. Šis langas yra laikinas, kol
              Teen Challenge Lietuva pateiks oficialią vaizdo medžiagą.
            </p>
            <div className="mt-6">
              <Button variant="navy" onClick={() => setVideoOpen(false)}>
                Uždaryti
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
