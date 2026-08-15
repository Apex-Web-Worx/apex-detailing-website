import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Info,
  Shield,
  Sparkles,
  Star,
  Wand2,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import OptimizedImage, { imageUrl } from "@/components/OptimizedImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PKG_PHOTO } from "@/i18n/packageMap";
import { bookingUrl, goBookNow } from "@/lib/openBooking";

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
};

const MORE_SERVICES: MoreService[] = [
  { id: "exterior-detailing", pkg: "exterior", pricing: "$150", Icon: Car },
  { id: "wash-clay-wax", pkg: "wax", pricing: "$250", Icon: Sparkles },
  { id: "headlight-restoration", pkg: "headlight", pricing: "$125", Icon: CheckCircle2 },
];

export default function EliteServicesSection({
  addons,
}: {
  addons?: ReactNode;
}) {
  const { t, list } = useLanguage();
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const anim = reduce || visible ? " is-animated" : "";

  return (
    <section id="services" ref={rootRef} className="elite-services apex-cv">
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
              const feats = list(`pkg.${service.pkg}.feat`).slice(0, 5);
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
                      sizes="(max-width: 699px) calc(100vw - 32px), (max-width: 1099px) 46vw, 420px"
                      loading="lazy"
                    />
                    <div className="elite-card__media-shade" aria-hidden="true" />
                    <div className="elite-card__icon-wrap" aria-hidden="true">
                      <service.Icon className="elite-card__icon" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="elite-card__body">
                    <h3 className="elite-card__name">{t(`pkg.${service.pkg}.title`)}</h3>
                    {!/call/i.test(service.pricing) ? (
                      <>
                        <p className="elite-card__starting">{t("services.startingAt")}</p>
                        <p className="elite-card__price">{service.pricing}</p>
                      </>
                    ) : (
                      <p className="elite-card__price elite-card__price--quote">{t("services.callQuote")}</p>
                    )}
                    <p className="elite-card__desc">{t(`pkg.${service.pkg}.desc`)}</p>
                    <ul className="elite-card__feats">
                      {feats.map((feature) => (
                        <li key={feature}>
                          <CheckCircle2 className="elite-card__feat-icon" aria-hidden="true" strokeWidth={2.2} />
                          <span>{feature}</span>
                        </li>
                      ))}
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
