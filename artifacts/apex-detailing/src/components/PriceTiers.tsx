import { useLanguage } from "@/i18n/LanguageProvider";
import { packagePriceTiers } from "@/i18n/packageMap";

export default function PriceTiers({
  pkg,
  className = "",
}: {
  pkg: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const tiers = packagePriceTiers(t, pkg);
  if (tiers.length === 0) return null;

  return (
    <ul
      className={`apex-price-tiers${className ? ` ${className}` : ""}`}
      aria-label={t("services.priceByVehicle")}
    >
      {tiers.map((row) => (
        <li key={`${row.label}-${row.amount}`}>
          <span className="apex-price-tiers__label">{row.label}</span>
          <span className="apex-price-tiers__amount">{row.amount}</span>
        </li>
      ))}
    </ul>
  );
}
