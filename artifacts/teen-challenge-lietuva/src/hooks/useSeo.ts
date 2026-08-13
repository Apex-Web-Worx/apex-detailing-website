import { useEffect } from "react";
import { site } from "@/data/site";

type SeoProps = {
  title?: string;
  description?: string;
};

export function useSeo({ title, description }: SeoProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${site.name}`
      : site.title;
    document.title = fullTitle;

    const setMeta = (selector: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", value);
    };

    const desc = description ?? site.description;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', desc);
  }, [title, description]);
}
