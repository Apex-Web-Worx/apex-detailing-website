// TODO: Replace with verified Teen Challenge Lietuva news articles.

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  category: string;
  image: string;
  imageAlt: string;
  href: string;
};

export const news: NewsArticle[] = [
  {
    id: "news-1",
    slug: "naujas-gyvenimas-prasideda-cia",
    title: "Naujas gyvenimas prasideda čia",
    excerpt:
      "Laikinas įrašas apie viltį, pirmąjį žingsnį ir tai, kad pokytis visada turi pradžią.",
    body: [
      "Šis naujienų įrašas yra laikinas turinio pavyzdys. Jis nėra tikra Teen Challenge Lietuva naujiena.",
      "Kai organizacija pateiks patvirtintą pranešimą, šis tekstas bus pakeistas.",
    ],
    date: "2026-03-12",
    category: "Bendruomenė",
    image: "images/news-1.jpg",
    imageAlt: "Savanoriai ruošia pagalbą. Iliustracinė nuotrauka.",
    href: "/naujienos/naujas-gyvenimas-prasideda-cia",
  },
  {
    id: "news-2",
    slug: "padekite-mums-padeti-kitiems",
    title: "Padėkite mums padėti kitiems",
    excerpt:
      "Laikinas kvietimas paremti veiklą, kuri kuria saugią erdvę pokyčiui.",
    body: [
      "Šis naujienų įrašas yra laikinas turinio pavyzdys ir nėra tikras paramos kvietimas su konkrečiais faktais.",
      "Tikra paramos informacija bus paskelbta atskirame puslapyje, kai bus patvirtinta.",
    ],
    date: "2026-02-20",
    category: "Parama",
    image: "images/news-2.jpg",
    imageAlt: "Žmonės, dirbantys kartu. Iliustracinė nuotrauka.",
    href: "/naujienos/padekite-mums-padeti-kitiems",
  },
  {
    id: "news-3",
    slug: "viltis-kuri-keicia-gyvenimus",
    title: "Viltis, kuri keičia gyvenimus",
    excerpt:
      "Laikinas apmąstymas apie tikėjimą, atsinaujinimą ir naują gyvenimo kryptį.",
    body: [
      "Šis naujienų įrašas yra laikinas turinio pavyzdys.",
      "Jis bus pakeistas oficialiu Teen Challenge Lietuva turiniu.",
    ],
    date: "2026-01-18",
    category: "Viltis",
    image: "images/news-3.jpg",
    imageAlt: "Ištiestos pagalbos rankos. Iliustracinė nuotrauka.",
    href: "/naujienos/viltis-kuri-keicia-gyvenimus",
  },
];

export function getNewsBySlug(slug: string) {
  return news.find((article) => article.slug === slug);
}
