// TODO: Replace with verified, consented Teen Challenge Lietuva stories.
// These entries are placeholders and must not be presented as real people.

export type Story = {
  id: string;
  slug: string;
  quote: string;
  preview: string;
  body: string[];
  attribution: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  href: string;
};

export const stories: Story[] = [
  {
    id: "featured",
    slug: "viltis-pradeti-is-naujo",
    quote:
      "Maniau, kad mano gyvenimas jau baigtas. Čia atradau viltį pradėti iš naujo.",
    preview:
      "Laikina iliustracinė istorija apie žmogų, kuris ieškojo išeities ir rado naują pradžią.",
    body: [
      "Ši istorija yra laikinas turinio pavyzdys. Ji nėra tikro asmens liudijimas.",
      "Kai bus gautas dalyvio sutikimas ir patvirtintas tekstas, čia atsiras tikra istorija – su tikru vardu arba jo inicialais, kaip nurodys organizacija.",
      "Iki tol šis puslapis padeda parodyti, kaip svetainėje atrodys liudijimų skiltis.",
    ],
    attribution: "Vardas, programos dalyvis",
    image: "images/story-featured.jpg",
    imageAlt:
      "Žmogaus siluetas saulėlydyje. Iliustracinė nuotrauka, ne tikras dalyvis.",
    featured: true,
    href: "/istorijos/viltis-pradeti-is-naujo",
  },
  {
    id: "story-2",
    slug: "nauja-kryptis",
    quote: "Pirmą kartą pajutau, kad nesu savo istorijos pabaiga.",
    preview:
      "Laikinas tekstas apie krypties atradimą ir kasdienius mažus žingsnius.",
    body: [
      "Ši istorija yra laikinas turinio pavyzdys ir nėra tikro asmens liudijimas.",
      "Tikros istorijos bus skelbiamos tik gavus sutikimą ir patikrinus faktus.",
    ],
    attribution: "Vardas, programos dalyvis",
    image: "images/story-1.jpg",
    imageAlt: "Kalnų peizažas. Iliustracinė nuotrauka.",
    href: "/istorijos/nauja-kryptis",
  },
  {
    id: "story-3",
    slug: "laisve-kasdienybeje",
    quote: "Laisvė man dabar – tai ramus rytas ir aiškus kitas žingsnis.",
    preview:
      "Laikinas tekstas apie kasdienybę po sunkaus laikotarpio.",
    body: [
      "Ši istorija yra laikinas turinio pavyzdys ir nėra tikro asmens liudijimas.",
      "Čia vėliau bus paskelbtas patvirtintas liudijimas.",
    ],
    attribution: "Vardas, programos dalyvė",
    image: "images/story-2.jpg",
    imageAlt: "Kalnai ir šviesa. Iliustracinė nuotrauka.",
    href: "/istorijos/laisve-kasdienybeje",
  },
  {
    id: "story-4",
    slug: "ne-vienas",
    quote: "Svarbiausia buvo suprasti, kad nereikia eiti šio kelio vienam.",
    preview:
      "Laikinas tekstas apie bendruomenės reikšmę atsistatymo kelyje.",
    body: [
      "Ši istorija yra laikinas turinio pavyzdys ir nėra tikro asmens liudijimas.",
      "Tikros istorijos pakeis šį tekstą, kai organizacija jas patvirtins.",
    ],
    attribution: "Vardas, programos dalyvis",
    image: "images/story-3.jpg",
    imageAlt: "Miško šviesa. Iliustracinė nuotrauka.",
    href: "/istorijos/ne-vienas",
  },
];

export function getStoryBySlug(slug: string) {
  return stories.find((story) => story.slug === slug);
}

export function getFeaturedStory() {
  return stories.find((story) => story.featured) ?? stories[0];
}
