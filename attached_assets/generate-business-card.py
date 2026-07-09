#!/usr/bin/env python3
"""Generate Apex Detailing business cards using the user's actual logo PNG."""

from __future__ import annotations

import argparse
import base64
import textwrap
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = Path(__file__).parent
DEFAULT_LOGO = OUTPUT_DIR / "apex-hex-logo.png"
LOGOS_REPO = "https://github.com/apexwebworxusa-svg/logos"
LOGOS_RAW_BASE = "https://raw.githubusercontent.com/apexwebworxusa-svg/logos/main"
LOGO_CANDIDATES = [
    "apex-logo-primary.png",
    "06-primary-light-bg.png",
    "06-primary-light-bg (1).png",
    "apex-detailing-hex.png",
    "apex-detailing-logo.png",
    "logo.png",
]
CARD_W = 1050  # 3.5" @ 300 DPI
CARD_H = 600   # 2" @ 300 DPI

CONTACT = {
    "phone": "(417) 527-6165",
    "website": "apexdetailing.net",
    "email": "apexdetailing.net@gmail.com",
    "address": "1114 E Lakota St · Nixa, MO 65714",
    "instagram": "@apexdetailing_sf",
    "tagline": "ELEVATE YOUR RIDE TO ITS PEAK SHINE",
    "areas": "SPRINGFIELD · NIXA · OZARK",
}


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/macos/Inter-Bold.ttf" if bold else "/usr/share/fonts/truetype/macos/Inter-Regular.ttf",
        "/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf" if bold else "/usr/share/fonts/truetype/macos/Inter-Medium.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def remove_light_background(img: Image.Image, threshold: int = 235) -> Image.Image:
    """Make near-white pixels transparent so a white-background logo works on black."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def fit_logo(logo: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / logo.width, max_h / logo.height)
    new_size = (max(1, int(logo.width * ratio)), max(1, int(logo.height * ratio)))
    return logo.resize(new_size, Image.LANCZOS)


def paste_centered(base: Image.Image, overlay: Image.Image, y_offset: int = 0) -> None:
    x = (base.width - overlay.width) // 2
    y = (base.height - overlay.height) // 2 + y_offset
    base.paste(overlay, (x, y), overlay)


def draw_gradient_line(draw: ImageDraw.ImageDraw, y: int, width: int, height: int = 2) -> None:
    for x in range(width):
        t = x / max(width - 1, 1)
        if t < 0.5:
            r = int(224 + (160 - 224) * (t / 0.5))
            g = int(64 + (96 - 64) * (t / 0.5))
            b = int(160 + (208 - 160) * (t / 0.5))
        else:
            tt = (t - 0.5) / 0.5
            r = int(160 + (64 - 160) * tt)
            g = int(96 + (208 - 96) * tt)
            b = int(208 + (240 - 208) * tt)
        draw.line([(x, y), (x, y + height)], fill=(r, g, b))


def create_front(logo: Image.Image) -> Image.Image:
    card = Image.new("RGB", (CARD_W, CARD_H), "#000000")
    fitted = fit_logo(logo, int(CARD_W * 0.78), int(CARD_H * 0.82))
    paste_centered(card, fitted)
    return card


def create_back(small_logo: Image.Image | None = None) -> Image.Image:
    card = Image.new("RGB", (CARD_W, CARD_H), "#000000")
    draw = ImageDraw.Draw(card)

    draw_gradient_line(draw, 118, CARD_W, 2)
    draw_gradient_line(draw, 518, CARD_W, 1)

    if small_logo is not None:
        fitted = fit_logo(small_logo, 220, 120)
        paste_centered(card, fitted, y_offset=-190)

    draw.text(
        (CARD_W // 2, 150),
        CONTACT["tagline"],
        fill="#888888",
        font=load_font(13),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 255),
        CONTACT["phone"],
        fill="#FFFFFF",
        font=load_font(30, bold=True),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 310),
        CONTACT["website"],
        fill="#40D0F0",
        font=load_font(18, bold=True),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 350),
        CONTACT["email"],
        fill="#CCCCCC",
        font=load_font(14),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 395),
        CONTACT["address"],
        fill="#AAAAAA",
        font=load_font(14),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 435),
        CONTACT["instagram"],
        fill="#A060D0",
        font=load_font(13, bold=True),
        anchor="mm",
    )
    draw.text(
        (CARD_W // 2, 475),
        CONTACT["areas"],
        fill="#666666",
        font=load_font(11),
        anchor="mm",
    )
    return card


def create_preview(front: Image.Image, back: Image.Image) -> Image.Image:
    scale = 2
    fw, fh = front.width * scale, front.height * scale
    front_l = front.resize((fw, fh), Image.LANCZOS)
    back_l = back.resize((fw, fh), Image.LANCZOS)

    pad = 60
    label_h = 50
    canvas = Image.new("RGB", (pad * 3 + fw * 2, pad * 2 + label_h + fh + 40), "#111111")
    draw = ImageDraw.Draw(canvas)
    title_font = load_font(28, bold=True)
    label_font = load_font(20, bold=True)

    draw.text((canvas.width // 2, 20), "APEX DETAILING — Business Card Preview", fill="#888888", anchor="mt", font=title_font)

    y = pad + 30
    draw.text((pad + fw // 2, y), "FRONT", fill="#E040A0", anchor="mt", font=label_font)
    canvas.paste(front_l, (pad, y + label_h))

    x2 = pad * 2 + fw
    draw.text((x2 + fw // 2, y), "BACK", fill="#40D0F0", anchor="mt", font=label_font)
    canvas.paste(back_l, (x2, y + label_h))
    return canvas


def write_html_preview(front_path: Path, back_path: Path, preview_path: Path, html_path: Path) -> None:
    def b64(path: Path) -> str:
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"data:image/png;base64,{data}"

    html = textwrap.dedent(
        f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apex Detailing — Business Card Preview</title>
  <style>
    body {{ margin: 0; background: #0a0a0a; color: #fff; font-family: Inter, system-ui, sans-serif; padding: 2rem; }}
    h1, p {{ text-align: center; }}
    p {{ color: #888; }}
    .grid {{ display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }}
    img {{ max-width: min(100%, 520px); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.6); }}
    .preview {{ text-align: center; margin-top: 3rem; }}
  </style>
</head>
<body>
  <h1>APEX DETAILING — Business Card</h1>
  <p>Built from your uploaded logo file</p>
  <div class="grid">
    <div><h3>Front</h3><img src="{b64(front_path)}" alt="Front" /></div>
    <div><h3>Back</h3><img src="{b64(back_path)}" alt="Back" /></div>
  </div>
  <div class="preview">
    <h3>Combined Preview</h3>
    <img src="{b64(preview_path)}" alt="Preview" />
  </div>
</body>
</html>"""
    )
    html_path.write_text(html, encoding="utf-8")


def fetch_logo_from_github() -> Path:
    """Try to download the hex logo from the user's GitHub logos repo."""
    for name in LOGO_CANDIDATES:
        url = f"{LOGOS_RAW_BASE}/{name}"
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                data = response.read()
            if len(data) < 1000:
                continue
            dest = OUTPUT_DIR / "apex-hex-logo.png"
            dest.write_bytes(data)
            print(f"Downloaded logo from GitHub: {name}")
            return dest
        except urllib.error.HTTPError as exc:
            if exc.code != 404:
                raise
        except urllib.error.URLError:
            break
    raise FileNotFoundError(
        f"Could not download a logo from {LOGOS_REPO}.\n"
        "The repo may be private. Make it public temporarily, or copy your hex logo to "
        f"{DEFAULT_LOGO.name} in attached_assets/."
    )


def resolve_logo(logo_path: Path | None, from_github: bool) -> Path:
    if logo_path and logo_path.exists():
        return logo_path
    if from_github or (logo_path is None or logo_path == DEFAULT_LOGO):
        if DEFAULT_LOGO.exists():
            return DEFAULT_LOGO
        try:
            return fetch_logo_from_github()
        except FileNotFoundError:
            if logo_path and logo_path != DEFAULT_LOGO:
                raise FileNotFoundError(f"Logo file not found: {logo_path}") from None
            raise
    raise FileNotFoundError(
        f"Logo file not found: {logo_path}\n"
        f"Save your hex logo PNG to {DEFAULT_LOGO} or make {LOGOS_REPO} accessible."
    )


def generate(logo_path: Path) -> None:

    logo = remove_light_background(Image.open(logo_path))
    front = create_front(logo)
    back = create_back(small_logo=logo)
    preview = create_preview(front, back)

    front_path = OUTPUT_DIR / "apex-business-card-front.png"
    back_path = OUTPUT_DIR / "apex-business-card-back.png"
    preview_path = OUTPUT_DIR / "apex-business-card-preview.png"
    html_path = OUTPUT_DIR / "business-card-preview.html"

    front.save(front_path, "PNG")
    back.save(back_path, "PNG")
    preview.save(preview_path, "PNG")
    write_html_preview(front_path, back_path, preview_path, html_path)

    print(f"Using logo: {logo_path}")
    print(f"Saved: {front_path.name}")
    print(f"Saved: {back_path.name}")
    print(f"Saved: {preview_path.name}")
    print(f"Saved: {html_path.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Apex Detailing business cards from a logo PNG")
    parser.add_argument(
        "--logo",
        type=Path,
        default=DEFAULT_LOGO,
        help=f"Path to your logo PNG (default: {DEFAULT_LOGO.name})",
    )
    parser.add_argument(
        "--from-github",
        action="store_true",
        help=f"Fetch logo from {LOGOS_REPO}",
    )
    args = parser.parse_args()
    logo = resolve_logo(args.logo, args.from_github)
    generate(logo)


if __name__ == "__main__":
    main()
