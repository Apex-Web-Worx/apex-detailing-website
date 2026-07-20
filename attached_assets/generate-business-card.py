#!/usr/bin/env python3
"""Generate premium Apex Detailing business cards using the user's actual logo PNG."""

from __future__ import annotations

import argparse
import base64
import math
import random
import textwrap
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT_DIR = Path(__file__).parent
DEFAULT_LOGO = OUTPUT_DIR / "apex-hex-logo.png"
LOGOS_REPO = "https://github.com/apexwebworxusa-svg/logos"
LOGOS_RAW_BASE = "https://raw.githubusercontent.com/apexwebworxusa-svg/logos/main"
LOGO_CANDIDATES = [
    "apex-logo-primary.png",
    "06-primary-light-bg.png",
    "06-primary-light-bg (1).png",
    "logo.png",
]
CARD_W = 1050  # 3.5" @ 300 DPI
CARD_H = 600   # 2" @ 300 DPI

PINK = (224, 64, 160)
CYAN = (64, 208, 240)
PURPLE = (160, 96, 208)
CHARCOAL = (14, 14, 16)

CONTACT = {
    "name": "Michail Gurov",
    "title": "OWNER",
    "phone": "(417) 527-6165",
    "website": "apexdetailing.net",
    "instagram": "@apexdetailing_sf",
    "location": "Nixa, MO",
    "front_tagline": "PREMIUM AUTO DETAILING",
    "services": "INTERIOR DETAILING  •  EXTERIOR DETAILING  •  PAINT CORRECTION  •  CERAMIC COATING",
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


def lerp_color(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    if t < 0.5:
        tt = t / 0.5
        return (
            int(PINK[0] + (PURPLE[0] - PINK[0]) * tt),
            int(PINK[1] + (PURPLE[1] - PINK[1]) * tt),
            int(PINK[2] + (PURPLE[2] - PINK[2]) * tt),
        )
    tt = (t - 0.5) / 0.5
    return (
        int(PURPLE[0] + (CYAN[0] - PURPLE[0]) * tt),
        int(PURPLE[1] + (CYAN[1] - PURPLE[1]) * tt),
        int(PURPLE[2] + (CYAN[2] - PURPLE[2]) * tt),
    )


def remove_light_background(img: Image.Image, threshold: int = 235) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
            elif r < 30 and g < 30 and b < 30:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def fit_logo(logo: Image.Image, max_w: int, max_h: int) -> Image.Image:
    ratio = min(max_w / logo.width, max_h / logo.height)
    return logo.resize((max(1, int(logo.width * ratio)), max(1, int(logo.height * ratio))), Image.LANCZOS)


def create_textured_card_base() -> Image.Image:
    card = Image.new("RGB", (CARD_W, CARD_H), CHARCOAL)
    noise = Image.effect_noise((CARD_W, CARD_H), 12).convert("L")
    grain = Image.new("RGBA", (CARD_W, CARD_H), (255, 255, 255, 0))
    grain.putalpha(noise.point(lambda p: int(p * 0.07)))
    card.paste(grain, (0, 0), grain)

    overlay = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(CARD_H):
        t = y / CARD_H
        alpha = int(18 + 10 * math.sin(t * math.pi))
        draw.line([(0, y), (CARD_W, y)], fill=(255, 255, 255, alpha))
    card = Image.alpha_composite(card.convert("RGBA"), overlay).convert("RGB")
    return card


def draw_diagonal_accent(draw: ImageDraw.ImageDraw, corner: str, color: tuple[int, int, int], length: int = 120) -> None:
    width = 3
    if corner == "tl":
        draw.line([(0, 0), (length, length)], fill=color, width=width)
        draw.line([(20, 0), (length + 20, length)], fill=(*color, 120), width=1)
    elif corner == "br":
        draw.line([(CARD_W, CARD_H), (CARD_W - length, CARD_H - length)], fill=color, width=width)
    elif corner == "tr":
        draw.line([(CARD_W, 0), (CARD_W - length, length)], fill=color, width=width)


def draw_gradient_text(
    base: Image.Image,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.ImageFont,
    anchor: str = "mm",
) -> None:
    tmp = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(tmp)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_img = Image.new("RGBA", (text_w + 8, text_h + 8), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_img)
    text_draw.text((4 - bbox[0], 4 - bbox[1]), text, fill=(255, 255, 255, 255), font=font)

    grad = Image.new("RGBA", text_img.size, (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(grad)
    for x in range(text_img.width):
        grad_draw.line([(x, 0), (x, text_img.height)], fill=(*lerp_color(x / max(text_img.width - 1, 1)), 255))

    colored = Image.composite(grad, Image.new("RGBA", text_img.size, (0, 0, 0, 0)), text_img)
    if anchor == "mm":
        pos = (xy[0] - colored.width // 2, xy[1] - colored.height // 2)
    elif anchor == "ms":
        pos = (xy[0] - colored.width // 2, xy[1])
    else:
        pos = xy
    base.paste(colored, pos, colored)


def draw_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, color: tuple[int, int, int]) -> None:
    points = []
    for i in range(8):
        angle = math.pi / 2 + i * math.pi / 4
        radius = size if i % 2 == 0 else size * 0.4
        points.append((cx + math.cos(angle) * radius, cy - math.sin(angle) * radius))
    draw.polygon(points, fill=color)


def create_premium_front(logo: Image.Image) -> Image.Image:
    card = create_textured_card_base()
    draw = ImageDraw.Draw(card)

    draw_diagonal_accent(draw, "tl", PINK, 130)
    draw_diagonal_accent(draw, "br", CYAN, 130)

    fitted = fit_logo(logo, int(CARD_W * 0.62), int(CARD_H * 0.72))
    x = (CARD_W - fitted.width) // 2
    y = int(CARD_H * 0.08)
    card.paste(fitted, (x, y), fitted)

    draw_gradient_text(card, CONTACT["front_tagline"], (CARD_W // 2, CARD_H - 95), load_font(22, bold=True), "mm")

    line_y = CARD_H - 58
    line_half = 110
    draw.line([(CARD_W // 2 - line_half, line_y), (CARD_W // 2 - 18, line_y)], fill=PINK, width=2)
    draw.line([(CARD_W // 2 + 18, line_y), (CARD_W // 2 + line_half, line_y)], fill=CYAN, width=2)
    draw_star(draw, CARD_W // 2, line_y, 7, PURPLE)

    return card


def draw_icon_circle(draw: ImageDraw.ImageDraw, cx: int, cy: int, kind: str, color: tuple[int, int, int]) -> None:
    r = 18
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=color, width=2)
    if kind == "phone":
        draw.arc([(cx - 7, cy - 9), (cx + 7, cy + 9)], 220, 320, fill=color, width=2)
        draw.line([(cx, cy + 5), (cx, cy + 9)], fill=color, width=2)
    elif kind == "web":
        draw.ellipse([(cx - 8, cy - 8), (cx + 8, cy + 8)], outline=color, width=1)
        draw.line([(cx - 8, cy), (cx + 8, cy)], fill=color, width=1)
        draw.arc([(cx - 8, cy - 8), (cx + 8, cy + 8)], 0, 180, fill=color, width=1)
    elif kind == "social":
        draw.rounded_rectangle([(cx - 7, cy - 7), (cx + 7, cy + 7)], radius=4, outline=color, width=2)
        draw.ellipse([(cx - 3, cy - 3), (cx + 3, cy + 3)], outline=color, width=1)
    elif kind == "pin":
        draw.ellipse([(cx - 5, cy - 8), (cx + 5, cy + 2)], outline=color, width=2)
        draw.polygon([(cx, cy + 10), (cx - 4, cy + 2), (cx + 4, cy + 2)], fill=color)


def create_premium_back(logo: Image.Image) -> Image.Image:
    card = create_textured_card_base()
    draw = ImageDraw.Draw(card)

    draw_diagonal_accent(draw, "tr", CYAN, 100)

    fitted = fit_logo(logo, 290, 360)
    lx = 55
    ly = (CARD_H - fitted.height) // 2 - 20
    card.paste(fitted, (lx, ly), fitted)

    divider_x = 395
    for y in range(70, CARD_H - 85):
        draw.line([(divider_x, y), (divider_x, y + 1)], fill=lerp_color((y - 70) / (CARD_H - 155)))

    name_x = 455
    draw.text((name_x, 95), CONTACT["name"], fill="#FFFFFF", font=load_font(34, bold=True))
    draw.text((name_x, 138), CONTACT["title"], fill=PINK, font=load_font(16, bold=True))

    rows = [
        ("phone", CONTACT["phone"]),
        ("web", CONTACT["website"]),
        ("social", CONTACT["instagram"]),
        ("pin", CONTACT["location"]),
    ]
    y = 195
    for kind, value in rows:
        icon_cx = name_x + 18
        icon_cy = y + 16
        draw_icon_circle(draw, icon_cx, icon_cy, kind, CYAN if kind != "social" else PURPLE)
        draw.line([(name_x, y + 42), (CARD_W - 55, y + 42)], fill=(40, 40, 45), width=1)
        draw.text((name_x + 48, y + 8), value, fill="#E8E8E8", font=load_font(20 if kind == "phone" else 17, bold=(kind == "phone")))
        y += 58

    footer_y = CARD_H - 52
    draw.line([(45, footer_y - 18), (CARD_W - 45, footer_y - 18)], fill=(35, 35, 40), width=1)
    draw_gradient_text(card, CONTACT["services"], (CARD_W // 2, footer_y + 8), load_font(11, bold=True), "mm")

    return card


def add_card_shadow(card: Image.Image, padding: int = 30) -> Image.Image:
    shadow = Image.new("RGBA", (card.width + padding * 2, card.height + padding * 2), (0, 0, 0, 0))
    mask = Image.new("L", card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([(0, 0), card.size], radius=18, fill=255)
    blurred = Image.new("RGBA", card.size, (0, 0, 0, 180))
    blurred.putalpha(mask.filter(ImageFilter.GaussianBlur(12)))
    shadow.paste(blurred, (padding + 8, padding + 12), blurred)
    rounded = card.copy()
    clip = Image.new("L", card.size, 0)
    ImageDraw.Draw(clip).rounded_rectangle([(0, 0), card.size], radius=18, fill=255)
    out = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    out.paste(shadow, (0, 0), shadow)
    out.paste(rounded, (padding, padding), clip)
    return out


def create_mockup_screenshot(front: Image.Image, back: Image.Image) -> Image.Image:
    scale = 2
    front_s = add_card_shadow(front.resize((CARD_W * scale, CARD_H * scale), Image.LANCZOS))
    back_s = add_card_shadow(back.resize((CARD_W * scale, CARD_H * scale), Image.LANCZOS))

    pad = 100
    title_h = 120
    canvas = Image.new("RGB", (front_s.width + back_s.width + pad * 3, title_h + front_s.height + pad * 2), "#0a0a0c")
    draw = ImageDraw.Draw(canvas)

    draw.text((canvas.width // 2, 35), "APEX DETAILING", fill="#FFFFFF", anchor="mt", font=load_font(42, bold=True))
    draw.text((canvas.width // 2, 82), "Premium Business Card Design", fill="#777777", anchor="mt", font=load_font(20))

    y = title_h + 20
    x1 = pad
    x2 = pad * 2 + front_s.width
    draw.text((x1 + front_s.width // 2, y), "FRONT", fill=PINK, anchor="mt", font=load_font(18, bold=True))
    draw.text((x2 + back_s.width // 2, y), "BACK", fill=CYAN, anchor="mt", font=load_font(18, bold=True))

    canvas.paste(front_s, (x1, y + 35), front_s)
    canvas.paste(back_s, (x2, y + 35), back_s)
    return canvas


def create_preview(front: Image.Image, back: Image.Image) -> Image.Image:
    return create_mockup_screenshot(front, back)


def write_html_preview(front_path: Path, back_path: Path, preview_path: Path, html_path: Path) -> None:
    def b64(path: Path) -> str:
        return f"data:image/png;base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"

    html = textwrap.dedent(
        f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apex Detailing — Premium Business Card</title>
  <style>
    body {{ margin: 0; background: #0a0a0a; color: #fff; font-family: Inter, system-ui, sans-serif; padding: 2rem; }}
    h1, p {{ text-align: center; }}
    p {{ color: #888; }}
    img {{ max-width: min(100%, 960px); border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.6); display: block; margin: 2rem auto; }}
  </style>
</head>
<body>
  <h1>APEX DETAILING — Premium Business Card</h1>
  <p>Your real hex logo · Print-ready 3.5" × 2" @ 300 DPI</p>
  <img src="{b64(preview_path)}" alt="Business card mockup" />
  <img src="{b64(front_path)}" alt="Front" />
  <img src="{b64(back_path)}" alt="Back" />
</body>
</html>"""
    )
    html_path.write_text(html, encoding="utf-8")


def fetch_logo_from_github() -> Path:
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
    raise FileNotFoundError(f"Could not download a logo from {LOGOS_REPO}.")


def resolve_logo(logo_path: Path | None, from_github: bool) -> Path:
    if logo_path and logo_path.exists():
        return logo_path
    if from_github or (logo_path is None or logo_path == DEFAULT_LOGO):
        if DEFAULT_LOGO.exists():
            return DEFAULT_LOGO
        return fetch_logo_from_github()
    raise FileNotFoundError(f"Logo file not found: {logo_path}")


def generate(logo_path: Path) -> None:
    logo_file = Path(logo_path)
    logo = Image.open(logo_file).convert("RGBA")
    if "light-bg" in logo_file.name.lower():
        logo = remove_light_background(logo)

    front = create_premium_front(logo)
    back = create_premium_back(logo)
    preview = create_preview(front, back)
    screenshot = preview.copy()

    front_path = OUTPUT_DIR / "apex-business-card-front.png"
    back_path = OUTPUT_DIR / "apex-business-card-back.png"
    preview_path = OUTPUT_DIR / "apex-business-card-preview.png"
    screenshot_path = OUTPUT_DIR / "apex-business-card-screenshot.png"
    html_path = OUTPUT_DIR / "business-card-preview.html"

    front.save(front_path, "PNG")
    back.save(back_path, "PNG")
    preview.save(preview_path, "PNG")
    screenshot.save(screenshot_path, "PNG")
    write_html_preview(front_path, back_path, preview_path, html_path)

    screenshot.copy().save("/opt/cursor/artifacts/screenshots/apex-business-card-screenshot.png")

    print(f"Using logo: {logo_path}")
    for path in [front_path, back_path, preview_path, screenshot_path, html_path]:
        print(f"Saved: {path.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate premium Apex Detailing business cards")
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--from-github", action="store_true")
    args = parser.parse_args()
    generate(resolve_logo(args.logo, args.from_github))


if __name__ == "__main__":
    main()
