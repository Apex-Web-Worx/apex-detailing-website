import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { STRINGS, type Lang } from "./strings";
import {
  applyDocumentSeo,
  readLangFromLocation,
  syncLangQuery,
} from "./seo";

const STORAGE_KEY = "apex_lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  list: (prefix: string) => string[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return "en";
}

function readInitialLang(): Lang {
  return readLangFromLocation() ?? readStoredLang();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    const fromUrl = readLangFromLocation();
    if (fromUrl && fromUrl !== lang) setLangState(fromUrl);
    // Pathname changes (not lang) should still honor ?lang=ru on shared links.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL is source of truth on navigation
  }, [location]);

  useEffect(() => {
    const onAdmin = window.location.pathname.includes("/admin");
    document.documentElement.lang = onAdmin ? "en" : lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (!onAdmin) {
      syncLangQuery(lang);
      applyDocumentSeo(lang, location);
    }
  }, [lang, location]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const t = useCallback(
    (key: string) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key,
    [lang],
  );

  const list = useCallback(
    (prefix: string) => {
      const items: string[] = [];
      for (let i = 0; i < 40; i++) {
        const key = `${prefix}.${i}`;
        const value = STRINGS[lang][key] ?? STRINGS.en[key];
        if (value == null) break;
        items.push(value);
      }
      return items;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, list }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
