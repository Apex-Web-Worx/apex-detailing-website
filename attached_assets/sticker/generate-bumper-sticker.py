#!/usr/bin/env python3
"""Apex Detailing bumper sticker — QR code to the website.

Print size: 8" × 3" @ 300 DPI (also 10" × 3.5").
Scan target: https://www.apexdetailing.net
"""

from __future__ import annotations

import math
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
BUMPER_REF = ROOT / "bumper" / "reference-bumper.png"
OUT = ROOT / "bumper"

URL = "https://www.apexdetailing.net"
URL_DISPLAY = "apexdetailing.net"
PHONE = "(417) 527-6165"
BRAND = "APEX DETAILING"
CTA = "SCAN TO BOOK"

MAGENTA = (255, 26, 216)
PURPLE = (157, 0, 255)
CYAN = (0, 229, 255)
BLACK = (10, 10, 12)
WHITE = (255, 255, 255)
MUTED = (196, 214, 224)

DPI = 300
# 8x3 is a common bumper-badge size; QR is ~2" so it scans from a few feet.
SIZES = [(8.0, 3.0), (10.0, 3.5)]


def font(size: int, weight: str = "bold") -> ImageFont.FreeTypeFont:
    names = {
        "bold": "Inter-Bold.ttf",
        "semibold": "Inter-SemiBold.ttf",
        "medium": "Inter-Medium.ttf",
        "regular": "Inter-Regular.ttf",
    }
    path = Path("/usr/share/fonts/truetype/macos") / names.get(weight, "Inter-Bold.ttf")
    return ImageFont.truetype(str(path), size)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def brand_color(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    if t < 0.5:
        return lerp(MAGENTA, PURPLE, t / 0.5)
    return lerp(PURPLE, CYAN, (t - 0.5) / 0.5)


def badge_polygon(w: int, h: int, inset: float = 0) -> list[tuple[float, float]]:
    """Horizontal badge: pointed left/right, slightly arched top/bottom — Cerakote-style."""
    m = inset
    # chamfer depth ~ 18% of height
    ch = (h - 2 * m) * 0.22
    x0, y0, x1, y1 = m, m, w - 1 - m, h - 1 - m
    midy = h / 2
    # slight arch on top/bottom (Cerakote plaque)
    arch = (h - 2 * m) * 0.06
    return [
        (x0 + ch, y0 + arch),
        (w / 2, y0),  # top arch peak
        (x1 - ch, y0 + arch),
        (x1, midy),  # right point
        (x1 - ch, y1 - arch),
        (w / 2, y1),  # bottom arch
        (x0 + ch, y1 - arch),
        (x0, midy),  # left point
    ]


def draw_gradient_polyline(img: Image.Image, pts: list[tuple[float, float]], width: int) -> None:
    """Stroke a closed polygon with a left→right magenta→cyan gradient."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    closed = pts + [pts[0]]
    w = img.width
    # dense segments
    for i in range(len(closed) - 1):
        x0, y0 = closed[i]
        x1, y1 = closed[i + 1]
        dist = math.hypot(x1 - x0, y1 - y0)
        steps = max(1, int(dist / 2))
        for s in range(steps + 1):
            t = s / steps
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t
            col = brand_color(x / w)
            r = width / 2
            d.ellipse([x - r, y - r, x + r, y + r], fill=(*col, 255))
    img.alpha_composite(overlay)


def make_qr(pixel_size: int) -> Image.Image:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=2,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    return img.resize((pixel_size, pixel_size), Image.NEAREST)


def bumper_sticker(width_in: float, height_in: float) -> Image.Image:
    w, h = int(width_in * DPI), int(height_in * DPI)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # white kiss-cut
    draw.polygon(badge_polygon(w, h, inset=2), fill=(*WHITE, 255))
    # black vinyl
    draw.polygon(badge_polygon(w, h, inset=int(0.045 * h)), fill=(*BLACK, 255))
    # inner neon border
    draw_gradient_polyline(canvas, badge_polygon(w, h, inset=int(0.10 * h)), width=max(4, int(0.028 * h)))
    # second hairline
    draw_gradient_polyline(canvas, badge_polygon(w, h, inset=int(0.145 * h)), width=max(2, int(0.010 * h)))

    # QR — ~64% of sticker height, left side
    qr_px = int(h * 0.62)
    qr = make_qr(qr_px)
    # white plate + thin cyan frame
    plate_pad = int(h * 0.028)
    plate = qr_px + plate_pad * 2
    qr_x = int(w * 0.11)
    qr_y = (h - plate) // 2
    frame = Image.new("RGBA", (plate, plate), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    rad = int(plate * 0.08)
    fd.rounded_rectangle([0, 0, plate - 1, plate - 1], radius=rad, fill=(255, 255, 255, 255))
    fd.rounded_rectangle(
        [2, 2, plate - 3, plate - 3],
        radius=max(2, rad - 2),
        outline=(*CYAN, 255),
        width=max(2, int(h * 0.008)),
    )
    frame.alpha_composite(qr, (plate_pad, plate_pad))
    canvas.alpha_composite(frame, (qr_x, qr_y))

    # text block to the right of QR
    tx = qr_x + plate + int(w * 0.045)
    text_right = int(w * 0.90)
    text_w = text_right - tx

    title_size = int(h * 0.16)
    url_size = int(h * 0.13)
    cta_size = int(h * 0.075)
    phone_size = int(h * 0.07)

    title_f = font(title_size, "bold")
    url_f = font(url_size, "semibold")
    cta_f = font(cta_size, "bold")
    phone_f = font(phone_size, "medium")

    # vertical stack, optically centered in remaining height
    lines = [
        (BRAND, title_f, WHITE),
        (CTA, cta_f, CYAN),
        (URL_DISPLAY, url_f, WHITE),
        (PHONE, phone_f, MUTED),
    ]
    heights = []
    for text, fnt, _ in lines:
        bb = fnt.getbbox(text)
        heights.append(bb[3] - bb[1])
    gap = int(h * 0.035)
    total = sum(heights) + gap * (len(lines) - 1)
    y = (h - total) // 2 - int(h * 0.01)

    d = ImageDraw.Draw(canvas)
    for (text, fnt, fill), lh in zip(lines, heights):
        # shrink if needed
        while fnt.getlength(text) > text_w and fnt.size > 12:
            fnt = font(fnt.size - 2, "bold" if fnt == title_f else "semibold")
        d.text((tx, y), text, font=fnt, fill=(*fill, 255))
        y += lh + gap

    # clip to badge so corners stay clean
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon(badge_polygon(w, h, inset=2), fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(canvas, (0, 0), mask)
    return out


def studio_card(sticker: Image.Image) -> Image.Image:
    pad = 120
    w, h = sticker.width + pad * 2, sticker.height + pad * 2
    bg = Image.new("RGBA", (w, h), (12, 12, 14, 255))
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([0, h // 4, w // 2, h], fill=(255, 26, 216, 35))
    gd.ellipse([w // 2, 0, w, h * 3 // 4], fill=(0, 229, 255, 35))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(50)))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 180), (pad + 10, pad + 16, pad + 10 + sticker.width, pad + 16 + sticker.height), sticker.split()[-1])
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(16)))
    bg.alpha_composite(sticker, (pad, pad))
    return bg.convert("RGB")


def overlay_on_bumper(sticker: Image.Image, bumper_path: Path) -> Image.Image:
    bumper = Image.open(bumper_path).convert("RGBA")
    bw, bh = bumper.size
    # Existing Cerakote badge sits ~center; target ~38% of photo width.
    target_w = int(bw * 0.38)
    ratio = target_w / sticker.width
    fitted = sticker.resize((target_w, max(1, int(sticker.height * ratio))), Image.LANCZOS)
    x = (bw - fitted.width) // 2
    # sit on the main bumper face, matching the reference badge
    y = int(bh * 0.22)
    # soft contact shadow
    shadow = Image.new("RGBA", bumper.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 90), (x + 4, y + 6, x + 4 + fitted.width, y + 6 + fitted.height), fitted.split()[-1])
    bumper.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(6)))
    bumper.alpha_composite(fitted, (x, y))
    return bumper.convert("RGB")


def print_sheet(sticker: Image.Image) -> Image.Image:
    sheet_w, sheet_h = int(11 * DPI), int(8.5 * DPI)  # landscape letter
    sheet = Image.new("RGB", (sheet_w, sheet_h), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    title = font(40, "bold")
    small = font(22, "medium")
    d.text((int(0.45 * DPI), int(0.32 * DPI)), "APEX DETAILING  —  BUMPER STICKER  8×3 in  @ 300 DPI", font=title, fill=(20, 20, 22))
    d.text(
        (int(0.45 * DPI), int(0.50 * DPI)),
        "Kiss-cut on the outer white edge  •  QR → https://www.apexdetailing.net  •  Gloss vinyl recommended",
        font=small,
        fill=(90, 90, 96),
    )
    # two copies stacked
    margin = int(0.55 * DPI)
    gap = int(0.35 * DPI)
    y = int(0.85 * DPI)
    for _ in range(2):
        x = (sheet_w - sticker.width) // 2
        # crop marks
        for mx, my, ox, oy in [
            (x, y, -18, 0), (x, y, 0, -18),
            (x + sticker.width, y, 18, 0), (x + sticker.width, y, 0, -18),
            (x, y + sticker.height, -18, 0), (x, y + sticker.height, 0, 18),
            (x + sticker.width, y + sticker.height, 18, 0), (x + sticker.width, y + sticker.height, 0, 18),
        ]:
            d.line([(mx, my), (mx + ox, my + oy)], fill=(40, 40, 44), width=2)
        sheet.paste(sticker, (x, y), sticker)
        y += sticker.height + gap
    return sheet


def save(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    if img.mode == "RGB" and name.lower().endswith(".jpg"):
        img.save(path, "JPEG", quality=90, optimize=True)
    else:
        img.save(path, "PNG", optimize=True)
    print(f"wrote {path}  {img.size} {img.mode}  {path.stat().st_size/1024:.0f}KB")


def main() -> None:
    sticker8 = bumper_sticker(8.0, 3.0)
    sticker10 = bumper_sticker(10.0, 3.5)
    save(sticker8, "apex-bumper-qr-8x3.png")
    save(sticker10, "apex-bumper-qr-10x35.png")
    save(studio_card(sticker8), "apex-bumper-qr-studio.jpg")
    save(print_sheet(sticker8), "apex-bumper-qr-print-sheet.png")

    qr = make_qr(1200)
    save(qr, "apex-qr-apexdetailing-net.png")

    if BUMPER_REF.exists():
        mock = overlay_on_bumper(sticker8, BUMPER_REF)
        save(mock, "apex-bumper-qr-on-car.jpg")


if __name__ == "__main__":
    main()
