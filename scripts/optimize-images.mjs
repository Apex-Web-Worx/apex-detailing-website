#!/usr/bin/env node
/**
 * Re-compress homepage image assets for mobile-friendly delivery.
 * Requires: ffmpeg, cwebp (apt: ffmpeg webp)
 *
 * Usage: node scripts/optimize-images.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_ROOT = path.join(ROOT, "artifacts/apex-detailing/public/images");
const MAX_EDGE = 1400;
const WEBP_Q = "78";
const JPG_Q = "3";

const PUBLIC_USED = [
  "hero-1.jpg",
  "hero-2.jpg",
  "hero-3.jpg",
  "hero-4.jpg",
  "about-hero.jpg",
  "paint-correction-1.jpg",
  "paint-correction-2.jpg",
  "paint-correction-3.jpg",
  "paint-correction-4.jpg",
  "paint-correction-5.jpg",
  "paint-correction-6.jpg",
  "paint-correction-7.jpg",
  "paint-correction-thumbnail.jpg",
  "gallery/paint-correction/IMG_1968.jpeg",
  "gallery/paint-correction/IMG_1969.jpeg",
  "gallery/paint-correction/IMG_1970.jpeg",
  "interior-before-1.jpg",
  "interior-after-1.jpg",
  "interior-before-2.jpg",
  "interior-after-2.jpg",
  "interior-before-3.jpg",
  "interior-after-3.jpg",
  "interior-before-4.jpg",
  "interior-after-4.jpg",
  "interior-before-5.jpg",
  "interior-after-5.jpg",
  "interior-before-6.jpg",
  "interior-after-6.jpg",
  "interior-before-7.jpg",
  "interior-after-7.jpg",
  "exterior-before-1.jpg",
  "exterior-after-1.jpg",
  "exterior-before-2.jpg",
  "exterior-after-2.jpg",
  "exterior-detail-thumbnail.jpg",
  "headlights-before-1.jpg",
  "headlights-after-1.jpg",
  "headlights-before-2.jpg",
  "headlights-after-2.jpg",
  "headlights-before-3.jpg",
  "headlights-after-3.jpg",
  "interior-restoration-thumbnail.jpg",
  "ceramic-3.jpg",
  "apex-webworx-logo.png",
  "owner-michail.jpg",
  "ba/interior-ba-1-before.jpg",
  "ba/interior-ba-1-after.jpg",
  "ba/interior-ba-2-before.jpg",
  "ba/interior-ba-2-after.jpg",
  "ba/interior-ba-3-before.jpg",
  "ba/interior-ba-3-after.jpg",
  "ba/paint-correction-before.jpg",
  "ba/paint-correction-after.jpg",
  "headlights-restoration-thumbnail.jpg",
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(`FAIL: ${cmd} ${args.join(" ")}`);
    console.error(r.stderr?.slice(-400));
    return false;
  }
  return true;
}

function optimizeFile(rel) {
  const src = path.join(IMG_ROOT, rel);
  if (!fs.existsSync(src)) {
    console.warn("MISSING", rel);
    return;
  }
  const before = fs.statSync(src).size;
  const ext = path.extname(src).toLowerCase();
  const tmpJpg = src + ".tmp.jpg";
  const vf =
    "scale='if(gt(iw\\,ih)\\,min(" +
    MAX_EDGE +
    "\\,iw)\\,-2)':'if(gt(iw\\,ih)\\,-2\\,min(" +
    MAX_EDGE +
    "\\,ih))'";

  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    if (!run("ffmpeg", ["-y", "-i", src, "-vf", vf, "-q:v", JPG_Q, "-frames:v", "1", tmpJpg])) {
      return;
    }
    const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
    run("cwebp", ["-quiet", "-q", WEBP_Q, tmpJpg, "-o", webp]);
    if (ext === ".png") {
      // Prefer keeping a smaller raster fallback as jpg for picture/fallback where used as img src
      fs.renameSync(tmpJpg, src.replace(/\.png$/i, ".jpg"));
      // leave original png if still referenced; also shrink png via copy of jpg not needed
    } else {
      fs.renameSync(tmpJpg, src);
    }
    const after = fs.existsSync(src) ? fs.statSync(src).size : before;
    const wsize = fs.existsSync(webp) ? fs.statSync(webp).size : 0;
    console.log(
      `${rel}: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(2)}MB / webp ${(wsize / 1e6).toFixed(2)}MB`,
    );
  }
}

for (const rel of PUBLIC_USED) {
  optimizeFile(rel);
}

console.log("Done. Prefer WebP via OptimizedImage / <picture>.");
