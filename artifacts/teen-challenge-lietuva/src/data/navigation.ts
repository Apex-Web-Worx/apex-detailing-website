export type NavItem = {
  label: string;
  href: string;
};

export const mainNav: NavItem[] = [
  { label: "Apie mus", href: "/apie-mus" },
  { label: "Mūsų veikla", href: "/musu-veikla" },
  { label: "Pagalba", href: "/pagalba" },
  { label: "Istorijos", href: "/istorijos" },
  { label: "Naujienos", href: "/naujienos" },
  { label: "Kontaktai", href: "/kontaktai" },
];

export const legalNav: NavItem[] = [
  { label: "Privatumo politika", href: "/privatumo-politika" },
  { label: "Slapukų politika", href: "/slapuku-politika" },
];
