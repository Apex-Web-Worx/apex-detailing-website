import { useEffect, useState } from "react";

export type VehicleImage = {
  url: string;
  title: string;
};

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

const memory = new Map<string, VehicleImage | null>();
const inflight = new Map<string, Promise<VehicleImage | null>>();
const STORAGE_PREFIX = "apex-vimg:";

type WikiPage = {
  title: string;
  index?: number;
  thumbnail?: { source: string };
  terms?: { description?: string[] };
};

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
  if (!thumb) return Number.NEGATIVE_INFINITY;
  const title = page.title ?? "";
  if (SKIP_TITLE.test(title)) return Number.NEGATIVE_INFINITY;
  const desc = (page.terms?.description ?? []).join(" ");
  if (/disambiguation/i.test(desc) || /list article/i.test(desc)) {
    return Number.NEGATIVE_INFINITY;
  }

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

function pickBest(pages: WikiPage[], query: string): VehicleImage | null {
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

function readSession(query: string): VehicleImage | null | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + query);
    if (raw == null) return undefined;
    return JSON.parse(raw) as VehicleImage | null;
  } catch {
    return undefined;
  }
}

function writeSession(query: string, value: VehicleImage | null) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + query, JSON.stringify(value));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

async function lookupViaApi(query: string): Promise<VehicleImage | null | undefined> {
  try {
    const res = await fetch(`/api/vehicle-image?q=${encodeURIComponent(query)}`);
    if (res.status === 404) return undefined;
    if (!res.ok) return undefined;
    const json = (await res.json()) as { url?: string | null; title?: string | null };
    if (!json.url) return null;
    return { url: json.url, title: json.title ?? query };
  } catch {
    return undefined;
  }
}

async function lookupViaWikipedia(query: string): Promise<VehicleImage | null> {
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
  const timer = window.setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    return pickBest(Object.values(data.query?.pages ?? {}), query);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function lookupVehicleImage(raw: string): Promise<VehicleImage | null> {
  const query = normalizeVehicleQuery(raw);
  if (!query) return null;
  if (memory.has(query)) return memory.get(query) ?? null;

  const stored = readSession(query);
  if (stored !== undefined) {
    memory.set(query, stored);
    return stored;
  }

  const existing = inflight.get(query);
  if (existing) return existing;

  const pending = (async () => {
    const fromApi = await lookupViaApi(query);
    const result = fromApi === undefined ? await lookupViaWikipedia(query) : fromApi;
    memory.set(query, result);
    writeSession(query, result);
    return result;
  })().finally(() => {
    inflight.delete(query);
  });

  inflight.set(query, pending);
  return pending;
}

export function useVehicleImage(vehicle: string, delayMs = 400) {
  const [image, setImage] = useState<VehicleImage | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "none">("idle");

  useEffect(() => {
    const query = normalizeVehicleQuery(vehicle);
    if (!query) {
      setImage(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      void lookupVehicleImage(vehicle).then((result) => {
        if (cancelled) return;
        setImage(result);
        setStatus(result ? "found" : "none");
      });
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [vehicle, delayMs]);

  return { image, status };
}
