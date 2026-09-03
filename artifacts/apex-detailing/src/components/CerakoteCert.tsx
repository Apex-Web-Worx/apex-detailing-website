import OptimizedImage, { imageUrl } from "@/components/OptimizedImage";
import { useLanguage } from "@/i18n/LanguageProvider";

type Variant = "card" | "about" | "strip" | "footer" | "nav";

export default function CerakoteCert({
  variant = "card",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const { t } = useLanguage();

  if (variant === "nav") {
    return (
      <span
        className={`cerakote-nav${className ? ` ${className}` : ""}`}
        aria-label={t("cerakote.navAria")}
      >
        <span className="cerakote-nav__divider" aria-hidden="true" />
        <span className="cerakote-nav__logos">
          <OptimizedImage
            src={imageUrl("cerakote/cerakote-wordmark-orange.png")}
            alt={t("cerakote.wordmarkAlt")}
            className="cerakote-nav__wordmark"
            loading="eager"
            noBlur
          />
          <OptimizedImage
            src={imageUrl("cerakote/cerakote-proteam-badge.png")}
            alt={t("cerakote.badgeAlt")}
            className="cerakote-nav__badge"
            loading="eager"
            noBlur
          />
        </span>
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <aside
        className={`cerakote-footer${className ? ` ${className}` : ""}`}
        aria-label={t("cerakote.footerAria")}
      >
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-proteam-badge.png")}
          alt={t("cerakote.badgeAlt")}
          className="cerakote-footer__badge"
          loading="lazy"
          noBlur
        />
      </aside>
    );
  }

  if (variant === "strip") {
    return (
      <aside
        className={`cerakote-strip${className ? ` ${className}` : ""}`}
        aria-label={t("cerakote.stripAria")}
      >
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-wordmark-orange.png")}
          alt={t("cerakote.wordmarkAlt")}
          className="cerakote-strip__wordmark"
          loading="lazy"
          noBlur
        />
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-proteam-badge.png")}
          alt={t("cerakote.badgeAlt")}
          className="cerakote-strip__badge"
          loading="lazy"
          noBlur
        />
        <p className="cerakote-strip__copy">{t("cerakote.stripLine")}</p>
      </aside>
    );
  }

  if (variant === "about") {
    return (
      <aside
        className={`cerakote-about${className ? ` ${className}` : ""}`}
        aria-label={t("cerakote.aboutAria")}
      >
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-proteam-badge.png")}
          alt={t("cerakote.badgeAlt")}
          className="cerakote-about__badge"
          loading="lazy"
          noBlur
        />
        <div className="cerakote-about__copy">
          <p className="cerakote-about__eyebrow">{t("cerakote.aboutEyebrow")}</p>
          <p className="cerakote-about__title">{t("cerakote.aboutTitle")}</p>
          <p className="cerakote-about__text">{t("cerakote.aboutText")}</p>
        </div>
      </aside>
    );
  }

  return (
    <div
      className={`cerakote-card${className ? ` ${className}` : ""}`}
      aria-label={t("cerakote.cardAria")}
    >
      <div className="cerakote-card__logos">
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-wordmark-orange.png")}
          alt={t("cerakote.wordmarkAlt")}
          className="cerakote-card__wordmark"
          loading="lazy"
          noBlur
        />
        <OptimizedImage
          src={imageUrl("cerakote/cerakote-proteam-badge.png")}
          alt={t("cerakote.badgeAlt")}
          className="cerakote-card__badge"
          loading="lazy"
          noBlur
        />
      </div>
      <p className="cerakote-card__label">
        <span>{t("cerakote.cardLine1")}</span>
        <span>{t("cerakote.cardLine2")}</span>
      </p>
    </div>
  );
}
