import { Award, ChevronRight, MapPin, Shield, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { bookingUrl, goBookNow } from "@/lib/openBooking";

type Props = {
  bookingHref: string;
  giftHref: string;
  reviewsHref: string;
  onExplore: (e: React.MouseEvent) => void;
};

export default function HeroCopy({
  bookingHref,
  giftHref,
  reviewsHref,
  onExplore,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="apex-hero-copy">
      <div className="apex-hero-badge">
        <span className="apex-hero-badge-dot" />
        <span>{t("hero.badge")}</span>
      </div>
      <h1 className="apex-hero-title">
        {t("hero.title1")}
        <br />
        <span className="apex-hero-title-grad">{t("hero.title2")}</span>
      </h1>
      <p className="apex-hero-sub">
        <span className="apex-hero-sub-lead">{t("hero.subtitleLead")}</span>
        {t("hero.subtitleRest")}
        <span className="text-potential font-bold"> Nixa Ozark Springfield, MO</span>
        {t("hero.subtitleEnd")}
      </p>
      <div className="apex-hero-ctas">
        <a href={bookingUrl()} onClick={goBookNow} className="btn-cyber btn-cyber-lg group">
          <span>{t("hero.book")}</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </a>
        <a href={giftHref} className="btn-cyber btn-cyber-outline btn-cyber-lg group">
          <span>{t("hero.gift")}</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </a>
        <a
          href={`${import.meta.env.BASE_URL}#services`}
          onClick={onExplore}
          className="apex-hero-explore group"
        >
          {t("hero.explore")}
          <ChevronRight className="w-4 h-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
        </a>
      </div>
      <a
        href={reviewsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="apex-hero-rating"
        aria-label={t("hero.reviewsAria")}
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="font-bold text-white">5.0</span>
        <span className="apex-hero-stars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-3.5 h-3.5 text-[#E8C547]" fill="currentColor" />
          ))}
        </span>
        <span className="text-gray-300 text-sm">{t("hero.google")}</span>
      </a>
      <div className="apex-hero-trust">
        <div className="apex-hero-trust-item">
          <Shield className="apex-hero-trust-icon" strokeWidth={2.4} aria-hidden="true" />
          <span>{t("hero.guarantee")}</span>
        </div>
        <div className="apex-hero-trust-item">
          <Award className="apex-hero-trust-icon gold" strokeWidth={2.4} aria-hidden="true" />
          <span>{t("hero.googleStars")}</span>
        </div>
        <div className="apex-hero-trust-item">
          <MapPin className="apex-hero-trust-icon" strokeWidth={2.4} aria-hidden="true" />
          <span>{t("hero.shop")}</span>
        </div>
      </div>
      <p className="apex-hero-trust-line">
        <Shield strokeWidth={2.4} aria-hidden="true" />
        <span>{t("hero.guarantee")}</span>
        <span className="apex-hero-trust-sep" aria-hidden="true">
          ·
        </span>
        <MapPin strokeWidth={2.4} aria-hidden="true" />
        <span>{t("hero.shop")}</span>
      </p>
    </div>
  );
}
