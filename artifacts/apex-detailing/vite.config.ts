import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // When proxying to production, inject any catalog packages the live API
    // is still missing (e.g. Apex Moto) so local /book Choose Service matches
    // the homepage without waiting for a Replit publish.
    {
      name: "inject-catalog-fallbacks",
      configureServer(server) {
        const proxyTarget = process.env.API_PROXY;
        if (!proxyTarget) return;
        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split("?")[0] ?? "";
          if (req.method !== "GET" || url !== "/api/booking/services") {
            next();
            return;
          }
          try {
            const upstream = await fetch(`${proxyTarget.replace(/\/$/, "")}/api/booking/services`);
            const services = (await upstream.json()) as Array<{ slug: string; sortOrder: number; id: number }>;
            const { CATALOG_FALLBACKS } = await import("./src/i18n/catalogFallback");
            const have = new Set(services.map((s) => s.slug));
            const extras = CATALOG_FALLBACKS.filter((s) => !have.has(s.slug));
            const merged = extras.length
              ? [...services, ...extras].sort(
                  (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
                )
              : services;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.end(JSON.stringify(merged));
          } catch (err) {
            console.error("[inject-catalog-fallbacks]", err);
            next();
          }
        });
      },
    },
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    ...(process.env.API_PROXY
      ? {
          proxy: {
            "/api": {
              target: process.env.API_PROXY,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : {}),
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
