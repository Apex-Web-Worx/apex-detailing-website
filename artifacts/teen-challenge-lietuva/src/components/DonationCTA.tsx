import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { DonationAmountRow } from "@/components/DonationButton";
import { FadeIn } from "@/components/FadeIn";

export function DonationCTA() {
  const [amount, setAmount] = useState<number | null>(50);
  const [, setLocation] = useLocation();

  return (
    <section className="bg-green-dark py-20 text-white md:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
            Padėkite keisti gyvenimus
          </h2>
          <span className="mx-auto mt-5 block h-[3px] w-16 rounded-full bg-gold" aria-hidden="true" />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Jūsų parama padeda kurti aplinką, kurioje žmogus gali atrasti viltį,
            pagalbą ir naują pradžią.
          </p>
          <DonationAmountRow
            value={amount}
            onChange={setAmount}
            className="mt-8 justify-center"
          />
          <div className="mt-8">
            <Button
              arrow
              onClick={() => {
                // TODO: Connect payment processing.
                const query = amount ? `?suma=${amount}` : "";
                setLocation(`/parama${query}`);
              }}
            >
              Paremti dabar
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
