import { useState } from "react";
import {
  Car,
  Cog,
  createLucideIcon,
  Droplets,
  PawPrint,
  SprayCan,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

/** Shield + sun — interior plastic UV / UV-style protection. */
const UvProtectIcon = createLucideIcon("AddonUvProtect", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "shield",
    },
  ],
  ["circle", { cx: "12", cy: "12.2", r: "2.1", key: "sun" }],
  [
    "path",
    {
      d: "M12 8.4v1.1M12 15v1.1M8.9 9.1l.8.8M14.3 14.5l.8.8M8.4 12.2h1.1M14.5 12.2h1.1M8.9 15.3l.8-.8M14.3 9.9l.8-.8",
      key: "rays",
    },
  ],
]);

/** Clay bar block. */
const ClayBarIcon = createLucideIcon("AddonClayBar", [
  ["rect", { width: "16", height: "7", x: "4", y: "8.5", rx: "2.2", key: "bar" }],
  ["path", { d: "M8 8.5v7M12 8.5v7M16 8.5v7", key: "grooves" }],
  ["path", { d: "M18.5 4.2v2M17.5 5.2h2", key: "shine" }],
]);

/** Droplets + sparkle — wash / clay / wax. */
const WashSparkleIcon = createLucideIcon("AddonWashSparkle", [
  [
    "path",
    {
      d: "M8 14.5a2.6 2.6 0 0 0 5.2 0c0-2-2.6-5-2.6-5S8 12.5 8 14.5z",
      key: "drop",
    },
  ],
  ["path", { d: "M16.5 5.5v3M15 7h3", key: "spark-lg" }],
  ["path", { d: "M19.2 9.2v1.8M18.3 10.1h1.8", key: "spark-sm" }],
]);

/** Automotive headlight + rays. */
const HeadlightIcon = createLucideIcon("AddonHeadlight", [
  [
    "path",
    {
      d: "M4.5 8.2c0-1.4 1-2.5 2.3-2.7l5.2-.8c1.8-.3 3.5.9 3.8 2.7l.9 5.8c.2 1.5-.8 2.9-2.3 3.2l-5.4 1.1c-1.5.3-3-.7-3.3-2.2z",
      key: "housing",
    },
  ],
  ["ellipse", { cx: "10.2", cy: "12", rx: "3.1", ry: "3.4", key: "lens" }],
  ["path", { d: "M16.6 7.4 20.5 5.6", key: "ray-top" }],
  ["path", { d: "M17.2 12h4.2", key: "ray-mid" }],
  ["path", { d: "M16.6 16.6 20.5 18.4", key: "ray-bot" }],
]);

type AddonDef = {
  id: string;
  price: string;
  Icon: LucideIcon;
};

const INTERIOR_ADDONS: AddonDef[] = [
  { id: "pet-hair", price: "$0 – $100", Icon: PawPrint },
  { id: "deep-shampooing", price: "$120+", Icon: Droplets },
  { id: "plastic-uv", price: "$60", Icon: UvProtectIcon },
];

const EXTERIOR_ADDONS: AddonDef[] = [
  { id: "exterior-detailing", price: "Sedan: $150 | SUV: $200", Icon: Car },
  { id: "wash-clay-wax", price: "Sedan: $250 | SUV: $300–$350", Icon: WashSparkleIcon },
  { id: "dress-exterior", price: "$45", Icon: SprayCan },
  { id: "clay-bar", price: "$55+", Icon: ClayBarIcon },
  { id: "headlight", price: "$125", Icon: HeadlightIcon },
  { id: "engine-bay", price: "$60+", Icon: Cog },
];

function AddonCard({ addon }: { addon: AddonDef }) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const name = t(`addon.${addon.id}.name`);
  const description = t(`addon.${addon.id}.desc`);
  const Icon = addon.Icon;

  return (
    <div
      className="apex-addon-card"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="apex-addon-card__icon-wrap" aria-hidden="true">
        <Icon className="apex-addon-card__icon" strokeWidth={2} />
      </div>
      <div className="apex-addon-card__copy">
        <h4 className="apex-addon-card__name">{name}</h4>
        <p className="apex-addon-card__price">{addon.price}</p>
        {description ? (
          <div
            className={`apex-addon-card__desc${isExpanded ? " is-open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((open) => !open);
            }}
          >
            <p>{description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AddonColumn({
  title,
  addons,
}: {
  title: string;
  addons: AddonDef[];
}) {
  return (
    <div className="apex-addons__col">
      <h3 className="apex-addons__col-title">
        <span>{title}</span>
      </h3>
      <div className="apex-addons__list">
        {addons.map((addon) => (
          <AddonCard key={addon.id} addon={addon} />
        ))}
      </div>
    </div>
  );
}

export default function AddonsSection() {
  const { t } = useLanguage();

  return (
    <div className="apex-addons elite-services__addons">
      <div className="apex-addons__glow" aria-hidden="true" />

      <header className="apex-addons__header">
        <p className="apex-addons__eyebrow">{t("addons.customize")}</p>
        <p className="apex-addons__optional">{t("addons.optional")}</p>
      </header>

      <div className="apex-addons__columns">
        <AddonColumn title={t("addons.interior")} addons={INTERIOR_ADDONS} />
        <div className="apex-addons__divider" aria-hidden="true" />
        <AddonColumn title={t("addons.exterior")} addons={EXTERIOR_ADDONS} />
      </div>
    </div>
  );
}
