import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useRoute } from "wouter";
import {
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { bookingUrl, goBookNow } from "@/lib/openBooking";

const CONTENT_ENDPOINT =
  "https://apex-seo-ai.vercel.app/api/public/content";
const CONTENT_DOMAIN = "apexdetailing.net";
const BOOKING_LINK = "/book";
const INSTAGRAM_LINK = "https://www.instagram.com/apexdetailing_sf";
const FACEBOOK_LINK =
  "https://www.facebook.com/profile.php?id=61556776603500";
const GOOGLE_REVIEWS_LINK = "https://g.page/r/CQphdJbRExhREAE/review";

type PostSummary = {
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
};

type ContentPost = PostSummary & {
  content: string;
  ai_answer?: string;
  json_ld?: unknown;
};

type ApiListResponse = {
  posts?: PostSummary[];
};

type ApiPostResponse = {
  post?: ContentPost;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPostList(payload: unknown): PostSummary[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is PostSummary =>
        isRecord(item) &&
        typeof item.slug === "string" &&
        typeof item.title === "string",
    );
  }

  if (
    isRecord(payload) &&
    Array.isArray((payload as ApiListResponse).posts)
  ) {
    return (payload as ApiListResponse).posts!.filter(
      (item): item is PostSummary =>
        isRecord(item) &&
        typeof item.slug === "string" &&
        typeof item.title === "string",
    );
  }

  return [];
}

function getPost(payload: unknown): ContentPost | null {
  if (!isRecord(payload) || !isRecord((payload as ApiPostResponse).post)) {
    return null;
  }

  const post = (payload as ApiPostResponse).post!;
  if (
    typeof post.slug !== "string" ||
    typeof post.title !== "string" ||
    typeof post.content !== "string"
  ) {
    return null;
  }

  return post;
}

async function fetchContent<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Content request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return (
            <strong key={`${part}-${index}`} className="font-bold text-white">
              {boldMatch[1]}
            </strong>
          );
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const [, label, href] = linkMatch;
          const isSafeHref =
            href.startsWith("/") ||
            href.startsWith("https://") ||
            href.startsWith("http://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:");

          if (isSafeHref) {
            return (
              <a
                key={`${part}-${index}`}
                href={href}
                className="text-[#00E5FF] hover:underline"
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {label}
              </a>
            );
          }
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function MarkdownBody({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const rendered: ReactNode[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];
    let blockIndex = 0;

    const flushParagraph = () => {
      if (paragraph.length === 0) return;
      rendered.push(
        <p
          key={`paragraph-${blockIndex++}`}
          className="text-gray-300 text-base sm:text-lg leading-8"
        >
          <InlineMarkdown text={paragraph.join(" ")} />
        </p>,
      );
      paragraph = [];
    };

    const flushList = () => {
      if (list.length === 0) return;
      rendered.push(
        <ul
          key={`list-${blockIndex++}`}
          className="list-disc space-y-2 pl-6 text-gray-300 text-base sm:text-lg leading-8"
        >
          {list.map((item, index) => (
            <li key={`${item}-${index}`}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>,
      );
      list = [];
    };

    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        const level = headingMatch[1].length;
        const Heading = level >= 3 ? "h3" : "h2";
        const className =
          level >= 3
            ? "text-xl sm:text-2xl font-bold text-white pt-4"
            : "text-2xl sm:text-3xl font-black uppercase tracking-tight text-white pt-6";
        rendered.push(
          <Heading key={`heading-${blockIndex++}`} className={className}>
            <InlineMarkdown text={headingMatch[2]} />
          </Heading>,
        );
        return;
      }

      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        flushParagraph();
        list.push(listMatch[1]);
        return;
      }

      flushList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();
    return rendered;
  }, [content]);

  return <div className="space-y-6">{blocks}</div>;
}

function SiteNavigation() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const homeHref = base ? `${base}/` : "/";
  const giftCardsHref = base ? `${base}/gift-cards` : "/gift-cards";
  const homeSectionHref = (section: string) => `${homeHref}#${section}`;

  const links = [
    { id: "home", href: homeHref },
    { id: "services", href: homeSectionHref("services") },
    { id: "about", href: homeSectionHref("about") },
    { id: "gallery", href: homeSectionHref("gallery") },
    { id: "testimonials", href: homeSectionHref("testimonials") },
    { id: "faq", href: homeSectionHref("faq") },
    { id: "journal", href: base ? `${base}/blog` : "/blog" },
    { id: "gift", href: giftCardsHref },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full overflow-visible bg-[#0a0a0a]/95 py-3 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="brand-logo-nav relative z-10 flex shrink-0 items-center"
            aria-label="Apex Detailing home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo
              variant="nav"
              priority
              className="brand-logo-nav__mark h-14 w-auto max-w-[7.5rem] object-contain opacity-100 md:h-16 md:max-w-[9.5rem] lg:h-[4.25rem]"
            />
            <span className="brand-logo-nav__sheen" aria-hidden="true" />
          </Link>

          <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5 min-w-0">
            <LanguageToggle className="shrink-0" />
            <a
              href="tel:417-527-6165"
              className="inline-flex items-center gap-1.5 text-[11px] lg:text-xs font-semibold text-white transition-colors hover:text-[#00E5FF] whitespace-nowrap shrink-0"
              aria-label="Call Apex Detailing"
            >
              <Phone className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span>{t("nav.call")}</span>
            </a>
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="group relative text-[11px] lg:text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:text-white whitespace-nowrap"
              >
                {t(`nav.${link.id}`)}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a href={bookingUrl()} onClick={goBookNow} className="btn-cyber btn-cyber-sm whitespace-nowrap shrink-0">
              <span>{t("nav.book")}</span>
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle />
            <a
              href="tel:417-527-6165"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
              aria-label="Call Apex Detailing"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-white focus:outline-none"
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed left-0 right-0 top-20 z-40 w-full overflow-hidden border-b border-white/10 bg-[#0a0a0a] transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "max-h-[500px] py-4 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-4 px-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-lg font-semibold uppercase tracking-wider text-gray-300 hover:text-white"
            >
              {t(`nav.${link.id}`)}
            </a>
          ))}
          <a
            href={bookingUrl()}
            onClick={goBookNow}
            className="btn-cyber btn-cyber-block mt-4"
          >
            <span>{t("nav.book")}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function SiteFooter() {
  const { t } = useLanguage();
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const homeHref = base ? `${base}/` : "/";
  const giftCardsHref = base ? `${base}/gift-cards` : "/gift-cards";
  const homeSectionHref = (section: string) => `${homeHref}#${section}`;
  const quickLinks = [
    { id: "home", href: homeHref },
    { id: "services", href: homeSectionHref("services") },
    { id: "about", href: homeSectionHref("about") },
    { id: "gallery", href: homeSectionHref("gallery") },
    { id: "testimonials", href: homeSectionHref("testimonials") },
    { id: "faq", href: homeSectionHref("faq") },
    { id: "journal", href: base ? `${base}/blog` : "/blog" },
    { id: "gift", href: giftCardsHref },
  ];
  const services = [
    "pkg.full.title",
    "pkg.interior.title",
    "pkg.exterior.title",
    "pkg.ceramic.title",
    "pkg.paint.title",
    "pkg.headlight.title",
  ];

  return (
    <footer className="border-t border-white/5 bg-[#050505] pb-10 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:mb-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mb-6 flex items-center">
              <BrandLogo
                variant="footer"
                className="relative z-10 h-20 w-auto max-w-[10rem] object-contain opacity-100"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(255,26,216,0.45))",
                }}
              />
            </div>
            <p className="mb-6 font-medium text-gray-400">
              {t("footer.blurb")}
            </p>
            <div className="flex gap-4">
              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-gradient-to-tr hover:from-[#FF1AD8] hover:to-[#00E5FF]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={FACEBOOK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-[#00E5FF]"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={GOOGLE_REVIEWS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-[#EA4335]"
                aria-label="Google Reviews"
              >
                <span className="font-bold text-white">G</span>
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-lg font-black uppercase tracking-wider">
              {t("footer.links")}
            </h2>
            <ul className="space-y-3 font-medium text-gray-400">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 transition-all hover:translate-x-1 hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-[#00E5FF]" />
                    {t(`nav.${link.id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-lg font-black uppercase tracking-wider">
              {t("footer.services")}
            </h2>
            <ul className="space-y-3 font-medium text-gray-400">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-[#FF1AD8]" />
                  {t(service)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 text-lg font-black uppercase tracking-wider">
              {t("footer.contact")}
            </h2>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#00E5FF]" />
                <a
                  href="https://www.google.com/maps/search/1114+E+Lakota+St,+65714+Nixa,+MO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left transition-colors hover:text-[#00E5FF]"
                >
                  Located in Nixa
                  <br />
                  1114 E Lakota St, 65714
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#FF1AD8]" />
                <a
                  href="tel:417-527-6165"
                  className="transition-colors hover:text-[#00E5FF]"
                >
                  417-527-6165
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#FF1AD8]" />
                <div className="text-sm">
                  <p className="font-bold text-white">{t("footer.monSat")}</p>
                  <p>{t("footer.hoursTime")}</p>
                  <p className="mt-1 text-gray-500">{t("footer.closedSun")}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#00E5FF]" />
                <span>{t("footer.social")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-white/10 py-6 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 transition-all"
            aria-label="APEX WEB WORX"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              loading="lazy"
              decoding="async"
              alt="APEX WEB WORX"
              className="h-16 w-auto object-contain opacity-70 transition-opacity group-hover:opacity-100"
            />
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500 transition-colors group-hover:text-white">
              {t("footer.designed")}{" "}
              <span className="text-potential font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm font-medium text-gray-500">
            &copy; {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-500 sm:gap-6 md:justify-end">
            <Link href="/privacy" className="transition-colors hover:text-white">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-36 text-white sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-potential">
            {t("journal.kicker")}
          </p>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl">
            {t("journal.title")}{" "}
            <span className="brand-gradient-text">{t("journal.titleAccent")}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            {t("journal.sub")}
          </p>
          <p className="mt-3 text-sm text-[#23B9FF]">{t("journal.enOnly")}</p>
        </div>

        {posts.length === 0 ? (
          <div className="surface-card rounded-2xl p-8 text-gray-300">
            {t("journal.empty")}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="surface-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5FF]/50"
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                  Apex Detailing
                </p>
                <h2 className="text-2xl font-black leading-tight text-white">
                  {post.title}
                </h2>
                {post.meta_description && (
                  <p className="mt-4 leading-7 text-gray-400">
                    {post.meta_description}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-[#00E5FF] transition-colors group-hover:text-white"
                >
                  {t("journal.read")}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BlogPost({ post }: { post: ContentPost }) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-36 text-white sm:px-6 lg:px-8">
      <article className="container mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#00E5FF] transition-colors hover:text-white"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          {t("journal.back")}
        </Link>
        <header className="mb-12 border-b border-white/10 pb-10">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-potential">
            {t("journal.kicker")}
          </p>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">
            {post.title}
          </h1>
          {post.published_at && (
            <p className="mt-5 text-sm text-gray-500">
              {t("journal.published")}{" "}
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "long",
              }).format(new Date(post.published_at))}
            </p>
          )}
        </header>
        {post.ai_answer && (
          <p
            data-ai-answer
            className="mb-10 border-l-2 border-[#00E5FF] bg-white/5 px-5 py-4 text-base leading-7 text-gray-200 sm:text-lg"
          >
            {post.ai_answer}
          </p>
        )}
        <MarkdownBody content={post.content} />
        <div className="mt-14 border-t border-white/10 pt-10">
          <p className="mb-5 text-lg font-semibold text-gray-300">
            Ready to protect and refresh your vehicle?
          </p>
          <a href={bookingUrl()} onClick={goBookNow} className="btn-cyber btn-cyber-lg">
            <span>Book now</span>
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </article>
    </main>
  );
}

export default function ApexContentPage() {
  const [, routeParams] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = routeParams?.slug;
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [post, setPost] = useState<ContentPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setPost(null);

    const endpoint = slug
      ? `${CONTENT_ENDPOINT}/${encodeURIComponent(slug)}?domain=${CONTENT_DOMAIN}`
      : `${CONTENT_ENDPOINT}?domain=${CONTENT_DOMAIN}`;

    fetchContent<unknown>(endpoint, controller.signal)
      .then((payload) => {
        if (slug) {
          const nextPost = getPost(payload);
          if (!nextPost) {
            throw new Error("This article could not be found.");
          }
          setPost(nextPost);
        } else {
          setPosts(getPostList(payload));
        }
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "We couldn't load the articles right now.",
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const title =
      post?.meta_title ??
      post?.title ??
      "Apex Detailing Journal | Missouri Detailing Tips";
    const description =
      post?.meta_description ??
      "Detailing tips and vehicle protection guidance from Apex Detailing in Nixa, Missouri.";
    document.title = title;
    let meta = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    const previousJsonLd = document.head.querySelector(
      'script[data-apex-content-json-ld="true"]',
    );
    previousJsonLd?.remove();

    if (post?.json_ld) {
      const jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.dataset.apexContentJsonLd = "true";
      jsonLdScript.textContent =
        typeof post.json_ld === "string"
          ? post.json_ld
          : JSON.stringify(post.json_ld);
      document.head.appendChild(jsonLdScript);

      return () => {
        jsonLdScript.remove();
      };
    }

    return undefined;
  }, [post]);

  const content = isLoading ? (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-40 text-white sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-16 max-w-3xl animate-pulse rounded bg-white/10" />
        <div className="mt-10 max-w-3xl space-y-4">
          <div className="h-5 animate-pulse rounded bg-white/10" />
          <div className="h-5 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </main>
  ) : error ? (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-40 text-white sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-widest text-[#FF1AD8]">
          Apex Detailing Journal
        </p>
        <h1 className="mt-4 text-4xl font-black">Article unavailable</h1>
        <p className="mt-5 text-lg leading-8 text-gray-400">{error}</p>
        <Link href="/blog" className="btn-cyber btn-cyber-lg mt-8">
          <span>View all articles</span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </main>
  ) : slug && post ? (
    <BlogPost post={post} />
  ) : (
    <BlogIndex posts={posts} />
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNavigation />
      {content}
      <SiteFooter />
    </div>
  );
}