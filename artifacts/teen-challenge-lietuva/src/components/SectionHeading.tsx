import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-extrabold uppercase tracking-[0.22em]",
            light ? "text-gold" : "text-navy",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]",
          light ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      <span
        className={cn(
          "mt-5 block h-[3px] w-16 rounded-full bg-gold",
          align === "center" && "mx-auto",
        )}
        aria-hidden="true"
      />
      {description ? (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            light ? "text-white/80" : "text-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
