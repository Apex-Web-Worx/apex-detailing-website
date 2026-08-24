import { type ReactNode } from "react";
import {
  AppWindow,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  createLucideIcon,
  DoorOpen,
  Droplets,
  Info,
  Shield,
  Sparkles,
  SprayCan,
  Star,
  Wand2,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import OptimizedImage, { imageUrl } from "@/components/OptimizedImage";
import PriceTiers from "@/components/PriceTiers";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PKG_PHOTO } from "@/i18n/packageMap";
import { bookingUrl, goBookNow } from "@/lib/openBooking";

/** Car silhouette + shine — exterior detailing (More Packages only). */
const ExteriorDetailIcon = createLucideIcon("ExteriorDetail", [
  [
    "path",
    {
      d: "M3.5 15.5h17v-2.4l-1.7-4.6A2.2 2.2 0 0 0 16.7 7H7.3a2.2 2.2 0 0 0-2.1 1.5L3.5 13.1z",
      key: "body",
    },
  ],
  ["path", { d: "M3.5 13.2h17", key: "belt" }],
  ["path", { d: "M7.2 7.4 8.6 11h6.8l1.4-3.6", key: "glass" }],
  ["circle", { cx: "7.2", cy: "17.2", r: "1.35", key: "wheel-l" }],
  ["circle", { cx: "16.8", cy: "17.2", r: "1.35", key: "wheel-r" }],
  ["path", { d: "M18.2 3.2v2.6M16.9 4.5h2.6", key: "shine-lg" }],
  ["path", { d: "M14.4 2.8v1.6M13.6 3.6h1.6", key: "shine-sm" }],
]);

/** Polishing pad + handle + shine — wash / clay / wax (More Packages only). */
const WashClayWaxIcon = createLucideIcon("WashClayWax", [
  ["circle", { cx: "10.5", cy: "13.5", r: "5.2", key: "pad" }],
  ["circle", { cx: "10.5", cy: "13.5", r: "2.1", key: "pad-inner" }],
  ["path", { d: "M14.4 9.6 19.2 4.8", key: "handle" }],
  ["path", { d: "M17.6 3.2h2.8v2.8", key: "handle-tip" }],
  ["path", { d: "M5.2 6.2v2.4M4 7.4h2.4", key: "shine-a" }],
  ["path", { d: "M7.8 3.6v1.6M7 4.4h1.6", key: "shine-b" }],
]);

/** Automotive headlight lens + rays — headlight restoration (More Packages only). */
const HeadlightRestoreIcon = createLucideIcon("HeadlightRestore", [
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

/** Clay bar block — feature bullets (More Packages). */
const ClayBarIcon = createLucideIcon("ClayBar", [
  ["rect", { width: "16", height: "7", x: "4", y: "8.5", rx: "2.2", key: "bar" }],
  ["path", { d: "M8 8.5v7M12 8.5v7M16 8.5v7", key: "grooves" }],
]);

/** Shield with shine — paint protection feature. */
const ShieldShineIcon = createLucideIcon("ShieldShine", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "shield",
    },
  ],
  ["path", { d: "M12 9.2v3.2M10.4 10.8h3.2", key: "shine" }],
]);

/** Droplet + shield — water/dirt repellent feature. */
const WaterRepelIcon = createLucideIcon("WaterRepel", [
  [
    "path",
    {
      d: "M8.5 14.5a3.5 3.5 0 0 0 7 0c0-2.6-3.5-6.6-3.5-6.6S8.5 11.9 8.5 14.5z",
      key: "drop",
    },
  ],
  [
    "path",
    {
      d: "M19.2 11.2V8.4a.6.6 0 0 0-.4-.56c-1.15-.4-2.4-1.15-3.2-1.95",
      key: "shield-r",
    },
  ],
  [
    "path",
    {
      d: "M4.8 11.2V8.4a.6.6 0 0 1 .4-.56c1.15-.4 2.4-1.15 3.2-1.95",
      key: "shield-l",
    },
  ],
]);

/** Shield + sun — UV protection feature. */
const UvProtectIcon = createLucideIcon("UvProtect", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "shield",
    },
  ],
  ["circle", { cx: "12", cy: "12.2", r: "2.1", key: "sun" }],
  ["path", { d: "M12 8.4v1.1M12 15v1.1M8.9 9.1l.8.8M14.3 14.5l.8.8M8.4 12.2h1.1M14.5 12.2h1.1M8.9 15.3l.8-.8M14.3 9.9l.8-.8", key: "rays" }],
]);

type FeaturedPkg = {
  pkg: "full" | "interior" | "express";
  price: string;
  badgeKey: "services.bestValue" | "services.mostBooked" | "services.express";
  BadgeIcon: LucideIcon;
  Icon: LucideIcon;
  featPrefix: string;
  featIcons: LucideIcon[];
};

const FEATURED: FeaturedPkg[] = [
  {
    pkg: "full",
    price: "$300",
    badgeKey: "services.bestValue",
    BadgeIcon: Star,
    Icon: Wand2,
    featPrefix: "pkg.full.feat",
    featIcons: [Car, Droplets, Shield, Sparkles, Wand2],
  },
  {
    pkg: "interior",
    price: "$200",
    badgeKey: "services.mostBooked",
    BadgeIcon: Star,
    Icon: Droplets,
    featPrefix: "pkg.interior.cardFeat",
    featIcons: [Sparkles, Droplets, Shield, Wind, Zap],
  },
  {
    pkg: "express",
    price: "$100",
    badgeKey: "services.express",
    BadgeIcon: Zap,
    Icon: Zap,
    featPrefix: "pkg.express.cardFeat",
    featIcons: [Sparkles, Droplets, Car, Wind, CheckCircle2],
  },
];

type MoreService = {
  id: string;
  pkg: string;
  pricing: string;
  Icon: LucideIcon;
  featIcons: LucideIcon[];
  badgeKey?: "services.premiumProtection";
  BadgeIcon?: LucideIcon;
  /** Prefer shorter card copy when present. */
  descKey?: string;
};

const MORE_SERVICES: MoreService[] = [
  {
    id: "exterior-detailing",
    pkg: "exterior",
    pricing: "$150",
    Icon: ExteriorDetailIcon,
    // Hand wash / Windows / Wheels / Door jambs / Spray sealant
    featIcons: [Car, AppWindow, CircleDot, DoorOpen, SprayCan],
  },
  {
    id: "wash-clay-wax",
    pkg: "wax",
    pricing: "$300",
    Icon: WashClayWaxIcon,
    // Hand wash / Clay bar / Wax / Paint protection / Water & dirt repellent
    featIcons: [Droplets, ClayBarIcon, Sparkles, ShieldShineIcon, WaterRepelIcon],
  },
  {
    id: "headlight-restoration",
    pkg: "headlight",
    pricing: "$125",
    Icon: HeadlightRestoreIcon,
    // Safety / Oxidation removal / UV protection
    featIcons: [HeadlightRestoreIcon, Sparkles, UvProtectIcon],
  },
  {
    id: "ceramic-coating",
    pkg: "ceramic",
    pricing: "$900",
    Icon: Shield,
    badgeKey: "services.premiumProtection",
    BadgeIcon: Shield,
    descKey: "pkg.ceramic.cardDesc",
    // Paint correction / decon / 9H / hydrophobic / UV / gloss
    featIcons: [Wand2, Sparkles, Shield, WaterRepelIcon, UvProtectIcon, ShieldShineIcon],
  },
];

export default function EliteServicesSection({
  addons,
}: {
  addons?: ReactNode;
}) {
  const { t, list } = useLanguage();
  /* Always animated — IO + opacity:0 left services blank on some mobile browsers. */
  const anim = " is-animated";

  return (
    <section id="services" className="elite-services">
      <div className="elite-services__atmosphere" aria-hidden="true">
        <span className="elite-services__glow elite-services__glow--pink" />
        <span className="elite-services__glow elite-services__glow--blue" />
        <span className="elite-services__glow elite-services__glow--floor" />
        <span className="elite-services__hex" />
      </div>

      <div className="elite-services__inner">
        <header className={`elite-services__header${anim}`}>
          <p className="elite-services__kicker">{t("services.kicker")}</p>
          <h2 className="elite-services__title">
            <span>{t("services.title")}</span>{" "}
            <span className="elite-services__title-grad">{t("services.titleAccent")}</span>
          </h2>
          <p className="elite-services__intro">{t("services.intro")}</p>
        </header>

        <aside
          className={`elite-services__note${anim}`}
          aria-label={t("services.pricingNoteLabel")}
        >
          <Info className="elite-services__note-icon" aria-hidden="true" strokeWidth={2.2} />
          <p>
            <span className="elite-services__note-label">{t("services.pricingNoteLabel")}</span>
            {t("services.pricingNote")}
          </p>
        </aside>

        <div className="elite-services__grid">
          {FEATURED.map((card, index) => {
            const feats = list(card.featPrefix);
            return (
              <article
                key={card.pkg}
                className={`elite-card${anim}`}
                style={{ ["--elite-delay" as string]: `${index * 100}ms` }}
              >
                <div className="elite-card__media">
                  <OptimizedImage
                    src={imageUrl(PKG_PHOTO[card.pkg])}
                    alt={t(`pkg.${card.pkg}.photoAlt`)}
                    className="elite-card__img"
                    sizes="(max-width: 699px) calc(100vw - 32px), (max-width: 1099px) 46vw, 420px"
                    loading="lazy"
                  />
                  <div className="elite-card__media-shade" aria-hidden="true" />
                  <div className="elite-card__icon-wrap" aria-hidden="true">
                    <card.Icon className="elite-card__icon" strokeWidth={2} />
                  </div>
                  <span className="elite-card__badge">
                    <card.BadgeIcon className="elite-card__badge-icon" fill="currentColor" />
                    {t(card.badgeKey)}
                  </span>
                </div>

                <div className="elite-card__body">
                  <h3 className="elite-card__name">{t(`pkg.${card.pkg}.title`)}</h3>
                  <p className="elite-card__starting">{t("services.startingAt")}</p>
                  <p className="elite-card__price">{card.price}</p>
                  <PriceTiers pkg={card.pkg} />
                  <p className="elite-card__desc">{t(`pkg.${card.pkg}.cardDesc`)}</p>
                  <ul className="elite-card__feats">
                    {feats.map((feature, i) => {
                      const FeatIcon = card.featIcons[i] ?? CheckCircle2;
                      return (
                        <li key={feature}>
                          <FeatIcon className="elite-card__feat-icon" aria-hidden="true" strokeWidth={2.2} />
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <a
                    href={bookingUrl()}
                    onClick={goBookNow}
                    className="btn-cyber elite-card__cta"
                  >
                    <span>{t("services.viewDetails")}</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className={`elite-ready${anim}`}>
          <div className="elite-ready__copy">
            <Calendar className="elite-ready__icon" aria-hidden="true" strokeWidth={2} />
            <div>
              <p className="elite-ready__title">{t("services.readyTitle")}</p>
              <p className="elite-ready__sub">{t("services.readySub")}</p>
            </div>
          </div>
          <a href={bookingUrl()} onClick={goBookNow} className="btn-cyber btn-cyber-lg elite-ready__btn">
            <span>{t("nav.book")}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="elite-more">
          <h3 className="elite-more__title">{t("services.moreTitle")}</h3>
          <div className="elite-services__grid elite-more__grid">
            {MORE_SERVICES.map((service, index) => {
              const feats = list(`pkg.${service.pkg}.feat`).slice(
                0,
                service.pkg === "ceramic" ? 6 : 5,
              );
              return (
                <article
                  key={service.id}
                  className={`elite-card${anim}`}
                  style={{ ["--elite-delay" as string]: `${180 + index * 80}ms` }}
                >
                  <div className="elite-card__media">
                    <OptimizedImage
                      src={imageUrl(PKG_PHOTO[service.pkg])}
                      alt={t(`pkg.${service.pkg}.photoAlt`)}
                      className="elite-card__img"
                      sizes="(max-width: 699px) calc(100vw - 32px), (max-width: 1099px) 46vw, 320px"
                      loading="lazy"
                    />
                    <div className="elite-card__media-shade" aria-hidden="true" />
                    <div className="elite-card__icon-wrap" aria-hidden="true">
                      <service.Icon className="elite-card__icon" strokeWidth={2} />
                    </div>
                    {service.badgeKey && service.BadgeIcon ? (
                      <span className="elite-card__badge">
                        <service.BadgeIcon className="elite-card__badge-icon" />
                        {t(service.badgeKey)}
                      </span>
                    ) : null}
                  </div>
                  <div className="elite-card__body">
                    <h3 className="elite-card__name">{t(`pkg.${service.pkg}.title`)}</h3>
                    {!/call/i.test(service.pricing) ? (
                      <>
                        <p className="elite-card__starting">{t("services.startingAt")}</p>
                        <p className="elite-card__price">{service.pricing}</p>
                        <PriceTiers pkg={service.pkg} />
                      </>
                    ) : (
                      <p className="elite-card__price elite-card__price--quote">{t("services.callQuote")}</p>
                    )}
                    <p className="elite-card__desc">
                      {t(service.descKey ?? `pkg.${service.pkg}.desc`)}
                    </p>
                    <ul className="elite-card__feats">
                      {feats.map((feature, featIndex) => {
                        const FeatIcon = service.featIcons[featIndex] ?? Sparkles;
                        return (
                          <li key={feature}>
                            <FeatIcon className="elite-card__feat-icon" aria-hidden="true" strokeWidth={2.2} />
                            <span>{feature}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <a
                      href={bookingUrl()}
                      onClick={goBookNow}
                      className="btn-cyber elite-card__cta"
                    >
                      <span>{t("services.viewDetails")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {addons}
      </div>
    </section>
  );
}
