import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { donationAmounts } from "@/data/site";
import { cn } from "@/lib/utils";

type DonationButtonProps = {
  amount?: number;
  selected?: boolean;
  onSelect?: (amount: number) => void;
  className?: string;
  tone?: "dark" | "light";
};

export function DonationButton({
  amount,
  selected = false,
  onSelect,
  className,
  tone = "dark",
}: DonationButtonProps) {
  const [, setLocation] = useLocation();

  if (amount && onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(amount)}
        aria-pressed={selected}
        className={cn(
          "min-w-[4.75rem] rounded-[12px] border px-4 py-3 text-base font-extrabold transition duration-200 hover:-translate-y-0.5",
          selected
            ? "border-gold bg-gold text-navy shadow-[0_8px_20px_rgba(249,185,22,0.25)]"
            : tone === "light"
              ? "border-line bg-white text-navy hover:border-navy/30"
              : "border-white/20 bg-white/10 text-white hover:border-gold/70 hover:bg-white/15",
          className,
        )}
      >
        {amount} €
      </button>
    );
  }

  return (
    <Button
      className={className}
      arrow
      onClick={() => {
        // TODO: Connect payment processing. This currently only routes to the support page.
        const query = amount ? `?suma=${amount}` : "";
        setLocation(`/parama${query}`);
      }}
    >
      Parama
    </Button>
  );
}

export function DonationAmountRow({
  value,
  onChange,
  className,
  tone = "dark",
}: {
  value: number | null;
  onChange: (amount: number) => void;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {donationAmounts.map((amount) => (
        <DonationButton
          key={amount}
          amount={amount}
          selected={value === amount}
          onSelect={onChange}
          tone={tone}
        />
      ))}
    </div>
  );
}
