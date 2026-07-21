import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from "react";

type OptimizedImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes"
> & {
  /** Path under BASE_URL, e.g. `images/hero-2.jpg` or a full `/...` / absolute URL */
  src: string;
  /** Optional explicit WebP path; defaults to same path with `.webp` */
  webpSrc?: string;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
};

function withBase(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  // Already absolute under the app base (e.g. from imageUrl())
  if (path.startsWith(normalizedBase) || (base !== "/" && path.startsWith(base))) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

function toWebpPath(src: string): string | null {
  if (/^(data:|blob:)/i.test(src)) return null;
  const cleaned = src.split("?")[0];
  if (!/\.(jpe?g|png)$/i.test(cleaned)) return null;
  return cleaned.replace(/\.(jpe?g|png)$/i, ".webp");
}

/**
 * Serves WebP when available with the original format as fallback.
 * Prefer paths under `public/images/` that have a matching `.webp` sibling.
 */
const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      webpSrc,
      alt,
      className,
      style,
      sizes,
      loading = "lazy",
      decoding = "async",
      ...rest
    },
    ref,
  ) {
    const resolved = withBase(src);
    const webp = webpSrc ? withBase(webpSrc) : toWebpPath(resolved);

    if (!webp) {
      return (
        <img
          ref={ref}
          src={resolved}
          alt={alt ?? ""}
          className={className}
          style={style}
          loading={loading}
          decoding={decoding}
          sizes={sizes}
          {...rest}
        />
      );
    }

    return (
      <picture>
        <source srcSet={webp} type="image/webp" sizes={sizes} />
        <img
          ref={ref}
          src={resolved}
          alt={alt ?? ""}
          className={className}
          style={style}
          loading={loading}
          decoding={decoding}
          sizes={sizes}
          {...rest}
        />
      </picture>
    );
  },
);

export default OptimizedImage;

/** Build a public image URL under BASE_URL. */
export function imageUrl(path: string): string {
  return withBase(path.startsWith("images/") || path.startsWith("videos/") ? path : `images/${path}`);
}
