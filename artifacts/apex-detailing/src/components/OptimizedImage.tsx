import {
  forwardRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";

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
  /** Skip blur-up placeholder (rare — e.g. tiny icons) */
  noBlur?: boolean;
};

function withBase(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  if (path.startsWith(normalizedBase) || (base !== "/" && path.startsWith(base))) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

function stripQuery(src: string): string {
  return src.split("?")[0];
}

function toWebpPath(src: string): string | null {
  if (/^(data:|blob:)/i.test(src)) return null;
  const cleaned = stripQuery(src);
  if (!/\.(jpe?g|png)$/i.test(cleaned)) return null;
  return cleaned.replace(/\.(jpe?g|png)$/i, ".webp");
}

function toSmWebpPath(src: string): string | null {
  if (/^(data:|blob:)/i.test(src)) return null;
  const cleaned = stripQuery(src);
  if (!/\.(jpe?g|png|webp)$/i.test(cleaned)) return null;
  return cleaned.replace(/\.(jpe?g|png|webp)$/i, ".sm.webp");
}

function toLqipPath(src: string): string | null {
  if (/^(data:|blob:)/i.test(src)) return null;
  const cleaned = stripQuery(src);
  if (!/\.(jpe?g|png|webp)$/i.test(cleaned)) return null;
  return cleaned.replace(/\.(jpe?g|png|webp)$/i, ".lqip.webp");
}

function toSmJpgPath(src: string): string | null {
  if (/^(data:|blob:)/i.test(src)) return null;
  const cleaned = stripQuery(src);
  if (!/\.(jpe?g|png)$/i.test(cleaned)) return null;
  return cleaned.replace(/\.(jpe?g|png)$/i, ".sm.jpg");
}

function objectFitFromClass(className?: string): CSSProperties["objectFit"] {
  if (!className) return "cover";
  if (/\bobject-contain\b/.test(className)) return "contain";
  if (/\bobject-fill\b/.test(className)) return "fill";
  if (/\bobject-none\b/.test(className)) return "none";
  return "cover";
}

/**
 * Responsive WebP (mobile `.sm` + full) with LQIP blur-up so a preview
 * paints immediately on cellular — no empty wait for the full photo.
 */
const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      webpSrc,
      alt,
      className,
      style,
      sizes = "(max-width: 768px) 100vw, min(1400px, 100vw)",
      loading = "lazy",
      decoding = "async",
      noBlur = false,
      onLoad,
      onError,
      ...rest
    },
    ref,
  ) {
    const resolved = withBase(src);
    const webp = webpSrc ? withBase(webpSrc) : toWebpPath(resolved);
    const webpSm = toSmWebpPath(resolved);
    const jpgSm = toSmJpgPath(resolved);
    const lqip = noBlur ? null : toLqipPath(resolved);

    const [loaded, setLoaded] = useState(false);
    const fit = objectFitFromClass(className);

    const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      onLoad?.(e);
    };
    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      onError?.(e);
    };

    const webpSrcSet =
      webp && webpSm ? `${webpSm} 720w, ${webp} 1400w` : webp || undefined;

    const jpgSrcSet =
      jpgSm && /\.(jpe?g)$/i.test(stripQuery(resolved))
        ? `${jpgSm} 720w, ${resolved} 1400w`
        : undefined;

    // Prefer the small JPEG as default src so slow phones never start a 1400px download first
    const imgSrc = jpgSm ?? resolved;

    const img = (
      <img
        ref={ref}
        src={imgSrc}
        srcSet={jpgSrcSet}
        alt={alt ?? ""}
        className={lqip ? undefined : className}
        style={
          lqip
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: fit,
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }
            : style
        }
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    );

    const pictured = webp ? (
      <picture className={lqip ? "contents" : undefined}>
        {webpSrcSet ? (
          <source srcSet={webpSrcSet} type="image/webp" sizes={sizes} />
        ) : (
          <source srcSet={webp} type="image/webp" sizes={sizes} />
        )}
        {img}
      </picture>
    ) : (
      img
    );

    if (!lqip) {
      return pictured;
    }

    return (
      <span
        className={className}
        style={{
          ...style,
          // Ensure absolute LQIP/photo children are positioned inside this box
          position:
            style?.position ??
            (className && /\b(absolute|fixed|relative|sticky)\b/.test(className)
              ? undefined
              : "relative"),
          backgroundColor: style?.backgroundColor ?? "#111",
          isolation: "isolate",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${lqip})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(16px)",
            transform: "scale(1.1)",
            opacity: loaded ? 0 : 1,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <span style={{ position: "absolute", inset: 0, zIndex: 1 }}>{pictured}</span>
      </span>
    );
  },
);

export default OptimizedImage;

/** Build a public image URL under BASE_URL. */
export function imageUrl(path: string): string {
  return withBase(path.startsWith("images/") || path.startsWith("videos/") ? path : `images/${path}`);
}
