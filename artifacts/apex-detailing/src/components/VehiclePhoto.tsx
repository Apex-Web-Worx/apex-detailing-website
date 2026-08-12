import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVehicleImage } from "@/lib/vehicleImage";

const SIZE = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-16 h-12 rounded-xl",
  lg: "w-40 h-24 sm:w-52 sm:h-32 rounded-2xl",
  hero: "w-full h-40 sm:h-52 rounded-2xl",
} as const;

export default function VehiclePhoto({
  vehicle,
  size = "md",
  className,
  showCredit = false,
}: {
  vehicle: string;
  size?: keyof typeof SIZE;
  className?: string;
  showCredit?: boolean;
}) {
  const { image, status } = useVehicleImage(vehicle);
  const box = cn(
    "relative overflow-hidden bg-white/[0.04] border border-white/10 shrink-0",
    SIZE[size],
    className,
  );

  if (status === "found" && image) {
    return (
      <div className={box}>
        <img
          src={image.url}
          alt={image.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {showCredit && (
          <span className="absolute bottom-1 right-1 text-[9px] leading-none px-1.5 py-0.5 rounded bg-black/60 text-white/80">
            Wikipedia
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn(box, "flex items-center justify-center", status === "loading" && "animate-pulse")}>
      <Car className={cn("text-white/25", size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-8 h-8")} />
    </div>
  );
}
