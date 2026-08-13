import type { Lang } from "./strings";

const ORIGIN = "https://www.apexdetailing.net";

type PageSeo = {
  title: string;
  description: string;
  keywords?: string;
};

const HOME_EN: PageSeo = {
  title: "Apex Detailing - Premium Car Detailing in Springfield, Nixa & Ozark, MO",
  description:
    "Detailing in Nixa, Ozark, Springfield MO. Premium auto detailing with ceramic coating, paint correction, interior detailing, and headlight restoration. 5-star rated service.",
  keywords:
    "detailing in Nixa, detailing in Ozark, detailing in Springfield MO, car detailing Nixa MO, auto detailing Springfield, ceramic coating Ozark, paint correction, interior detailing, headlight restoration",
};

const HOME_RU: PageSeo = {
  title: "Apex Detailing — премиум детейлинг в Никсе, Спрингфилде и Озарке, Миссури",
  description:
    "Детейлинг в Никсе, Озарке и Спрингфилде, Миссури. Керамика, коррекция ЛКП, салон и восстановление фар. Оценка 5 звёзд.",
  keywords:
    "детейлинг Никса, детейлинг Озарк, детейлинг Спрингфилд Миссури, автодетейлинг Nixa, керамика Ozark, коррекция ЛКП, детейлинг салона",
};

export const PAGE_SEO: Record<Lang, Record<"home" | "book" | "gift", PageSeo>> = {
  en: {
    home: HOME_EN,
    book: {
      title: "Book a Detail | Apex Detailing Nixa, MO",
      description:
        "Book premium auto detailing in Nixa, Missouri. Choose interior, exterior, ceramic coating, or paint correction and pick a time online.",
    },
    gift: {
      title: "Gift Cards | Apex Detailing Nixa, MO",
      description:
        "Give an Apex Detailing gift card. Instant email delivery. Never expires. Nixa, Springfield, and Ozark, Missouri.",
    },
  },
  ru: {
    home: HOME_RU,
    book: {
      title: "Запись на детейлинг | Apex Detailing Никса, Миссури",
      description:
        "Онлайн-запись на детейлинг в Никсе, Миссури. Салон, кузов, керамика или коррекция ЛКП — выберите услугу и время.",
    },
    gift: {
      title: "Подарочные карты | Apex Detailing Никса, Миссури",
      description:
        "Подарочная карта Apex Detailing. Мгновенно на email, без срока. Никса, Спрингфилд и Озарк, Миссури.",
    },
  },
};

function seoPage(pathname: string): "home" | "book" | "gift" | null {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/" || path === "") return "home";
  if (path === "/book") return "book";
  if (path === "/gift-cards") return "gift";
  return null;
}

function setMeta(selector: string, attr: "content" | "href", value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function upsertLink(rel: string, hreflang: string | null, href: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(sel) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function publicPageUrl(pathname: string, lang: Lang): string {
  const raw = pathname.replace(/\/$/, "") || "/";
  const base = raw === "/" ? `${ORIGIN}/` : `${ORIGIN}${raw}`;
  if (lang === "en") return base;
  return raw === "/" ? `${ORIGIN}/?lang=ru` : `${base}?lang=ru`;
}

export function applyDocumentSeo(lang: Lang, pathname: string) {
  if (typeof document === "undefined") return;
  const path = pathname.replace(/\/$/, "") || "/";
  if (path.startsWith("/admin") || path.startsWith("/blog")) return;

  const page = seoPage(path);
  document.documentElement.lang = path.startsWith("/privacy") || path.startsWith("/terms") ? "en" : lang;

  if (!page) return;

  const copy = PAGE_SEO[lang][page];
  const selfUrl = publicPageUrl(path, lang);
  const enUrl = publicPageUrl(path, "en");
  const ruUrl = publicPageUrl(path, "ru");

  document.title = copy.title;
  setMeta('meta[name="description"]', "content", copy.description);
  if (copy.keywords) setMeta('meta[name="keywords"]', "content", copy.keywords);
  setMeta('meta[property="og:title"]', "content", copy.title);
  setMeta('meta[property="og:description"]', "content", copy.description);
  setMeta('meta[property="og:url"]', "content", selfUrl);
  setMeta('meta[property="og:locale"]', "content", lang === "ru" ? "ru_RU" : "en_US");
  setMeta('meta[name="twitter:title"]', "content", copy.title);
  setMeta('meta[name="twitter:description"]', "content", copy.description);

  upsertLink("canonical", null, selfUrl);
  upsertLink("alternate", "en", enUrl);
  upsertLink("alternate", "ru", ruUrl);
  upsertLink("alternate", "x-default", enUrl);
}

export function syncLangQuery(lang: Lang) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.includes("/admin")) return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get("lang");
  if (lang === "ru") {
    if (current === "ru") return;
    url.searchParams.set("lang", "ru");
  } else {
    if (!current) return;
    url.searchParams.delete("lang");
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

export function readLangFromLocation(): Lang | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("lang");
  if (value === "ru" || value === "en") return value;
  return null;
}

