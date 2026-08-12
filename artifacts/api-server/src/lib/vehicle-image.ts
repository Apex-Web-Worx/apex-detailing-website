const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT =
  "ApexDetailing/1.0 (https://www.apexdetailing.net; vehicle photo lookup for booking UI)";

const COLOR_WORDS = new Set([
  "white",
  "black",
  "red",
  "blue",
  "silver",
  "gray",
  "grey",
  "pearl",
  "metallic",
  "navy",
  "gold",
  "beige",
  "tan",
  "brown",
  "orange",
  "yellow",
  "green",
  "purple",
  "pink",
  "charcoal",
  "graphite",
  "ivory",
  "cream",
  "maroon",
  "burgundy",
  "bronze",
  "copper",
  "teal",
  "turquoise",
  "champagne",
  "platinum",
  "obsidian",
  "midnight",
  "frost",
  "ice",
  "snow",
  "whitepearl",
]);

const FILLER_WORDS = new Set([
  "my",
  "our",
  "the",
  "a",
  "an",
  "with",
  "and",
  "or",
  "color",
  "colour",
  "miles",
  "mile",
  "mi",
  "mileage",
  "k",
  "vin",
  "approx",
  "about",
  "around",
]);

const GENERIC_WORDS = new Set([
  "car",
  "truck",
  "suv",
  "vehicle",
  "auto",
  "automobile",
  "van",
  "sedan",
  "coupe",
  "pickup",
]);

const ALIASES: Record<string, string> = {
  chevy: "chevrolet",
  vw: "volkswagen",
  benz: "mercedes-benz",
  mercedes: "mercedes-benz",
  f150: "f-150",
  f250: "f-250",
  f350: "f-350",
  f450: "f-450",
};

const SKIP_TITLE = /^(list of|history of)|disambiguation/i;
const BAD_DESC =
  /\b(engine|transmission|manufacturer|company|factory|hardware|plant|designer|film|album|sitcom|disambiguation|list article|joint venture|subsidiary|software|operating system)\b/i;
const GOOD_DESC =
  /\b(car|cars|truck|pickup|suv|sedan|coupe|crossover|vehicle|van|wagon|hatchback|roadster|motorcycle|automobile|utility vehicle|minivan|convertible|sports car|motor vehicle)\b/i;

export type VehicleImageResult = {
  url: string;
  title: string;
};

type WikiPage = {
  pageid: number;
  title: string;
  index?: number;
  thumbnail?: { source: string; width: number; height: number };
  terms?: { description?: string[] };
};

type CacheEntry = { at: number; value: VehicleImageResult | null };

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 400;

export function normalizeVehicleQuery(raw: string): string {
  let s = raw.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ");
  s = s.replace(/\b\d+[k]\b/g, " ");
  s = s.replace(/\b\d{1,3}(?:,\d{3})+\b/g, " ");
  s = s.replace(/\b\d{5,}\b/g, " ");

  const tokens = s
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ALIASES[t] ?? t)
    .filter((t) => !COLOR_WORDS.has(t) && !FILLER_WORDS.has(t));

  const meaningful = tokens.filter((t) => !GENERIC_WORDS.has(t));
  if (meaningful.length === 0) return "";
  const joined = meaningful.join(" ").trim();
  if (joined.replace(/[^a-z0-9]/g, "").length < 3) return "";
  return joined;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 0);
}

function scorePage(page: WikiPage, queryTokens: string[]): number {
  const thumb = page.thumbnail?.source;
  if (!thumb) return -Infinity;
  const title = page.title ?? "";
  if (SKIP_TITLE.test(title)) return -Infinity;
  const desc = (page.terms?.description ?? []).join(" ");
  if (/disambiguation/i.test(desc) || /list article/i.test(desc)) return -Infinity;

  let score = 90 - (page.index ?? 9) * 8;
  const titleTokens = new Set(tokenize(title));

  for (const t of queryTokens) {
    if (/^(19|20)\d{2}$/.test(t)) {
      if (titleTokens.has(t)) score += 8;
      continue;
    }
    if (titleTokens.has(t)) score += t.length >= 3 ? 28 : 10;
    else if (t.length >= 2) score -= 12;
  }

  if (GOOD_DESC.test(desc)) score += 18;
  if (BAD_DESC.test(desc)) score -= 45;

  const brandOnly = tokenize(title).filter((t) => t !== "inc");
  if (brandOnly.length <= 1 && queryTokens.filter((t) => !/^(19|20)\d{2}$/.test(t)).length >= 2) {
    score -= 40;
  }

  return score;
}

function pickBest(pages: WikiPage[], query: string): VehicleImageResult | null {
  const queryTokens = tokenize(query);
  let best: { page: WikiPage; score: number } | null = null;
  for (const page of pages) {
    const s = scorePage(page, queryTokens);
    if (!best || s > best.score) best = { page, score: s };
  }
  if (!best || best.score < 35) return null;
  const url = best.page.thumbnail?.source;
  if (!url) return null;
  return { url, title: best.page.title };
}

function pruneCache() {
  if (cache.size <= CACHE_MAX) return;
  const entries = [...cache.entries()].sort((a, b) => a[1].at - b[1].at);
  for (const [key] of entries.slice(0, cache.size - CACHE_MAX)) {
    cache.delete(key);
  }
}

async function searchWikipedia(query: string): Promise<WikiPage[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "pageimages|pageterms",
    piprop: "thumbnail",
    pithumbsize: "640",
    wbptterms: "description",
    format: "json",
    origin: "*",
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${WIKI_API}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    return Object.values(data.query?.pages ?? {});
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function lookupVehicleImage(raw: string): Promise<VehicleImageResult | null> {
  const query = normalizeVehicleQuery(raw);
  if (!query) return null;

  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const pages = await searchWikipedia(query);
  const value = pickBest(pages, query);
  cache.set(query, { at: Date.now(), value });
  pruneCache();
  return value;
}
