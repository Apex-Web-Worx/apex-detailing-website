import type { CSSProperties } from "react";

type BrandLogoProps = {
  variant?: "nav" | "splash" | "footer";
  className?: string;
  style?: CSSProperties;
  alt?: string;
  priority?: boolean;
};

/**
 * Optimized Apex logo — WebP first with PNG fallback.
 * Original logo.png (~936KB) stays for OG/social; UI uses resized assets.
 */
export default function BrandLogo({
  variant = "nav",
  className = "",
  style,
  alt = "Apex Detailing Logo",
  priority = false,
}: BrandLogoProps) {
  const base = import.meta.env.BASE_URL;
  const webp =
    variant === "splash"
      ? `${base}images/logo-splash.webp`
      : `${base}images/logo-nav.webp`;
  const png =
    variant === "splash"
      ? `${base}images/logo-splash.png`
      : `${base}images/logo-nav.png`;

  return (
    <picture className="contents">
      <source srcSet={webp} type="image/webp" />
      <img
        src={png}
        alt={alt}
        className={className}
        style={style}
        width={variant === "splash" ? 180 : 208}
        height={variant === "splash" ? 210 : 243}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
