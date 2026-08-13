// TODO: Replace with verified Teen Challenge Lietuva program information.

export type Program = {
  id: string;
  number: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string[];
  image: string;
  imageAlt: string;
  href: string;
};

export const programs: Program[] = [
  {
    id: "pagalba",
    number: "01",
    slug: "pagalba-priklausomybes-atveju",
    title: "Pagalba priklausomybės atveju",
    description:
      "Pirmasis žingsnis – saugus pokalbis ir aiškus kelias, kai žmogus ieško išeities.",
    longDescription: [
      "Šis aprašymas yra laikinas ir turi būti pakeistas oficialia Teen Challenge Lietuva programos informacija.",
      "Čia vėliau bus pateikta, kaip organizacija priima užklausas, kokią pirmąją pagalbą siūlo ir kaip prasideda kelias į pokytį.",
    ],
    image: "images/program-help.jpg",
    imageAlt: "Dviejų žmonių pokalbis pagalbos metu. Iliustracinė nuotrauka.",
    href: "/musu-veikla/pagalba-priklausomybes-atveju",
  },
  {
    id: "reabilitacija",
    number: "02",
    slug: "reabilitacija",
    title: "Reabilitacija",
    description:
      "Ilgalaikis, struktūruotas kelias, kuriame formuojasi nauji įpročiai ir vidinė ramybė.",
    longDescription: [
      "Šis aprašymas yra laikinas ir turi būti pakeistas oficialia Teen Challenge Lietuva reabilitacijos informacija.",
      "Čia vėliau bus aprašyta programos trukmė, kasdienė struktūra ir krikščioniško atnaujinimo pagrindai – tik po patvirtinimo.",
    ],
    image: "images/program-rehab.jpg",
    imageAlt: "Ramus rytas gamtoje. Iliustracinė nuotrauka apie vidinį atsinaujinimą.",
    href: "/musu-veikla/reabilitacija",
  },
  {
    id: "bendruomene",
    number: "03",
    slug: "bendruomene",
    title: "Bendruomenė",
    description:
      "Saugi aplinka, kurioje žmogus nėra paliktas vienas – pokytys auga kartu su kitais.",
    longDescription: [
      "Šis aprašymas yra laikinas ir turi būti pakeistas oficialia Teen Challenge Lietuva bendruomenės informacija.",
      "Čia vėliau bus papasakota, kaip atrodo kasdienis gyvenimas, palaikymas ir dvasinė bendrystė programoje.",
    ],
    image: "images/program-community.jpg",
    imageAlt: "Žmonių grupė, susėdusi kartu. Iliustracinė nuotrauka.",
    href: "/musu-veikla/bendruomene",
  },
  {
    id: "po-programos",
    number: "04",
    slug: "gyvenimas-po-programos",
    title: "Gyvenimas po programos",
    description:
      "Pagalba nesibaigia paskutine diena – svarbu turėti kryptį ir atramą tolesniame kelyje.",
    longDescription: [
      "Šis aprašymas yra laikinas ir turi būti pakeistas oficialia informacija apie gyvenimą po programos.",
      "Čia vėliau bus aprašyta, kokį tolesnį palaikymą organizacija gali suteikti – tik patvirtinus faktus.",
    ],
    image: "images/program-after.jpg",
    imageAlt: "Žalias takas, vedantis į šviesą. Iliustracinė nuotrauka apie naują kryptį.",
    href: "/musu-veikla/gyvenimas-po-programos",
  },
];

export function getProgramBySlug(slug: string) {
  return programs.find((program) => program.slug === slug);
}
