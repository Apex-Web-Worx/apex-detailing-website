import type { LucideIcon } from "lucide-react";
import { Church, Compass, Heart, Users } from "lucide-react";

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const features: FeatureItem[] = [
  {
    title: "Širdis",
    description: "Pagalba žmogui",
    icon: Heart,
  },
  {
    title: "Programos",
    description: "Ilgalaikis kelias į pokytį",
    icon: Compass,
  },
  {
    title: "Tikėjimas",
    description: "Viltis ir gyvenimo atnaujinimas",
    icon: Church,
  },
  {
    title: "Bendruomenė",
    description: "Saugi aplinka pokyčiui",
    icon: Users,
  },
];
