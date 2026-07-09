#!/usr/bin/env python3
"""Generate Apex Detailing business card assets (front + back) at print resolution."""

from __future__ import annotations

import textwrap
from pathlib import Path

import cairosvg

OUTPUT_DIR = Path(__file__).parent
CARD_W = 1050  # 3.5" @ 300 DPI
CARD_H = 600   # 2" @ 300 DPI

GRADIENT = """
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E040A0"/>
      <stop offset="50%" stop-color="#A060D0"/>
      <stop offset="100%" stop-color="#40D0F0"/>
    </linearGradient>
    <linearGradient id="brandGradV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E040A0"/>
      <stop offset="100%" stop-color="#40D0F0"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E040A0" stop-opacity="0"/>
      <stop offset="20%" stop-color="#E040A0"/>
      <stop offset="50%" stop-color="#A060D0"/>
      <stop offset="80%" stop-color="#40D0F0"/>
      <stop offset="100%" stop-color="#40D0F0" stop-opacity="0"/>
    </linearGradient>
  </defs>
"""

LOGO_SVG = textwrap.dedent(
    f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 480" width="420" height="480">
{GRADIENT}

  <!-- Outer hex frame -->
  <path d="M210 18 L372 112 L372 308 L210 402 L48 308 L48 112 Z"
        fill="none" stroke="url(#brandGrad)" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M210 34 L356 120 L356 300 L210 386 L64 300 L64 120 Z"
        fill="none" stroke="url(#brandGrad)" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>

  <!-- Sunburst -->
  <g transform="translate(210,118)" opacity="0.85">
    <circle cx="0" cy="0" r="8" fill="none" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="0" y1="-34" x2="0" y2="-52" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="24" y1="-24" x2="37" y2="-37" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="34" y1="0" x2="52" y2="0" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="24" y1="24" x2="37" y2="37" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="0" y1="34" x2="0" y2="52" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="-24" y1="24" x2="-37" y2="37" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="-34" y1="0" x2="-52" y2="0" stroke="url(#brandGrad)" stroke-width="1.2"/>
    <line x1="-24" y1="-24" x2="-37" y2="-37" stroke="url(#brandGrad)" stroke-width="1.2"/>
  </g>

  <!-- Mountains -->
  <path d="M72 168 L98 132 L124 168" fill="none" stroke="url(#brandGrad)" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M296 168 L322 132 L348 168" fill="none" stroke="url(#brandGrad)" stroke-width="1.8" stroke-linejoin="round"/>

  <!-- Sports car (top-down outline) -->
  <g transform="translate(210,118)" fill="none" stroke="url(#brandGrad)" stroke-width="2" stroke-linejoin="round">
    <path d="M-42 8 C-28 -10 28 -10 42 8 L48 18 C52 24 52 30 48 36 L42 46 C28 64 -28 64 -42 46 L-48 36 C-52 30 -52 24 -48 18 Z"/>
    <path d="M-18 8 L18 8" stroke-width="1.5"/>
    <path d="M-30 46 L30 46" stroke-width="1.5"/>
    <ellipse cx="-28" cy="30" rx="7" ry="10" stroke-width="1.5"/>
    <ellipse cx="28" cy="30" rx="7" ry="10" stroke-width="1.5"/>
    <path d="M-8 -2 L8 -2" stroke-width="1.2"/>
  </g>

  <!-- Road waves -->
  <path d="M95 178 Q130 188 165 178 T235 178 T305 178" fill="none" stroke="url(#brandGrad)" stroke-width="1.5" opacity="0.8"/>
  <path d="M95 188 Q130 198 165 188 T235 188 T305 188" fill="none" stroke="url(#brandGrad)" stroke-width="1.5" opacity="0.6"/>

  <!-- APEX -->
  <text x="210" y="268" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="62" font-weight="800" font-style="italic"
        fill="none" stroke="url(#brandGrad)" stroke-width="2.2"
        letter-spacing="2">APEX</text>

  <!-- DETAILING -->
  <text x="210" y="302" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="18" font-weight="500"
        fill="url(#brandGrad)" letter-spacing="12">DETAILING</text>

  <!-- Bottom accent -->
  <line x1="150" y1="352" x2="270" y2="352" stroke="url(#brandGrad)" stroke-width="1.2" opacity="0.7"/>
  <path d="M210 362 L214 370 L210 378 L206 370 Z" fill="url(#brandGrad)" opacity="0.9"/>
  <line x1="150" y1="388" x2="270" y2="388" stroke="url(#brandGrad)" stroke-width="1.2" opacity="0.7"/>
</svg>
"""
).strip()

FRONT_SVG = textwrap.dedent(
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
{GRADIENT}
  <rect width="{CARD_W}" height="{CARD_H}" fill="#000000"/>
  <g transform="translate({CARD_W // 2},{CARD_H // 2}) scale(0.82) translate(-210,-240)">
    <!-- Inline logo on front -->
    <path d="M210 18 L372 112 L372 308 L210 402 L48 308 L48 112 Z"
          fill="none" stroke="url(#brandGrad)" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M210 34 L356 120 L356 300 L210 386 L64 300 L64 120 Z"
          fill="none" stroke="url(#brandGrad)" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>
    <g transform="translate(210,118)" opacity="0.85">
      <circle cx="0" cy="0" r="8" fill="none" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="0" y1="-34" x2="0" y2="-52" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="24" y1="-24" x2="37" y2="-37" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="34" y1="0" x2="52" y2="0" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="24" y1="24" x2="37" y2="37" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="0" y1="34" x2="0" y2="52" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="-24" y1="24" x2="-37" y2="37" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="-34" y1="0" x2="-52" y2="0" stroke="url(#brandGrad)" stroke-width="1.2"/>
      <line x1="-24" y1="-24" x2="-37" y2="-37" stroke="url(#brandGrad)" stroke-width="1.2"/>
    </g>
    <path d="M72 168 L98 132 L124 168" fill="none" stroke="url(#brandGrad)" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M296 168 L322 132 L348 168" fill="none" stroke="url(#brandGrad)" stroke-width="1.8" stroke-linejoin="round"/>
    <g transform="translate(210,118)" fill="none" stroke="url(#brandGrad)" stroke-width="2" stroke-linejoin="round">
      <path d="M-42 8 C-28 -10 28 -10 42 8 L48 18 C52 24 52 30 48 36 L42 46 C28 64 -28 64 -42 46 L-48 36 C-52 30 -52 24 -48 18 Z"/>
      <path d="M-18 8 L18 8" stroke-width="1.5"/>
      <path d="M-30 46 L30 46" stroke-width="1.5"/>
      <ellipse cx="-28" cy="30" rx="7" ry="10" stroke-width="1.5"/>
      <ellipse cx="28" cy="30" rx="7" ry="10" stroke-width="1.5"/>
      <path d="M-8 -2 L8 -2" stroke-width="1.2"/>
    </g>
    <path d="M95 178 Q130 188 165 178 T235 178 T305 178" fill="none" stroke="url(#brandGrad)" stroke-width="1.5" opacity="0.8"/>
    <path d="M95 188 Q130 198 165 188 T235 188 T305 188" fill="none" stroke="url(#brandGrad)" stroke-width="1.5" opacity="0.6"/>
    <text x="210" y="268" text-anchor="middle"
          font-family="Inter, Helvetica Neue, Arial, sans-serif"
          font-size="62" font-weight="800" font-style="italic"
          fill="none" stroke="url(#brandGrad)" stroke-width="2.2"
          letter-spacing="2">APEX</text>
    <text x="210" y="302" text-anchor="middle"
          font-family="Inter, Helvetica Neue, Arial, sans-serif"
          font-size="18" font-weight="500"
          fill="url(#brandGrad)" letter-spacing="12">DETAILING</text>
    <line x1="150" y1="352" x2="270" y2="352" stroke="url(#brandGrad)" stroke-width="1.2" opacity="0.7"/>
    <path d="M210 362 L214 370 L210 378 L206 370 Z" fill="url(#brandGrad)" opacity="0.9"/>
    <line x1="150" y1="388" x2="270" y2="388" stroke="url(#brandGrad)" stroke-width="1.2" opacity="0.7"/>
  </g>
</svg>
"""
).strip()

BACK_SVG = textwrap.dedent(
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
{GRADIENT}
  <rect width="{CARD_W}" height="{CARD_H}" fill="#000000"/>

  <!-- Subtle corner accents -->
  <path d="M0 0 L80 0 L0 80 Z" fill="url(#brandGrad)" opacity="0.08"/>
  <path d="M{CARD_W} {CARD_H} L{CARD_W - 80} {CARD_H} L{CARD_W} {CARD_H - 80} Z" fill="url(#brandGrad)" opacity="0.08"/>

  <!-- Top brand mark -->
  <text x="{CARD_W // 2}" y="95" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="34" font-weight="800" font-style="italic"
        fill="none" stroke="url(#brandGrad)" stroke-width="1.4"
        letter-spacing="3">APEX</text>
  <text x="{CARD_W // 2}" y="125" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="11" font-weight="500"
        fill="url(#brandGrad)" letter-spacing="8">DETAILING</text>

  <line x1="200" y1="148" x2="850" y2="148" stroke="url(#accentLine)" stroke-width="2"/>

  <text x="{CARD_W // 2}" y="195" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="13" font-weight="400" fill="#888888" letter-spacing="3">
    ELEVATE YOUR RIDE TO ITS PEAK SHINE
  </text>

  <!-- Contact block -->
  <text x="{CARD_W // 2}" y="275" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="28" font-weight="700" fill="#FFFFFF">(417) 527-6165</text>

  <text x="{CARD_W // 2}" y="325" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="17" font-weight="500" fill="#40D0F0">apexdetailing.net</text>

  <text x="{CARD_W // 2}" y="365" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="14" font-weight="400" fill="#CCCCCC">apexdetailing.net@gmail.com</text>

  <text x="{CARD_W // 2}" y="410" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="14" font-weight="400" fill="#AAAAAA">1114 E Lakota St · Nixa, MO 65714</text>

  <text x="{CARD_W // 2}" y="450" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="13" font-weight="500" fill="#A060D0">@apexdetailing_sf</text>

  <text x="{CARD_W // 2}" y="485" text-anchor="middle"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-size="11" font-weight="400" fill="#666666" letter-spacing="2">
    SPRINGFIELD · NIXA · OZARK
  </text>

  <line x1="200" y1="520" x2="850" y2="520" stroke="url(#accentLine)" stroke-width="1.5"/>
</svg>
"""
).strip()

PRINT_SHEET_SVG = textwrap.dedent(
    f"""
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="2550" height="1650" viewBox="0 0 2550 1650">
  <rect width="2550" height="1650" fill="#1a1a1a"/>
  <text x="1275" y="60" text-anchor="middle" fill="#666"
        font-family="Inter, sans-serif" font-size="24">APEX DETAILING — Business Card Print Sheet (3.5" × 2" @ 300 DPI)</text>

  <!-- Front -->
  <g transform="translate(150,120)">
    <rect width="{CARD_W}" height="{CARD_H}" fill="#000" stroke="#333" stroke-width="2"/>
    <text x="0" y="-15" fill="#888" font-family="Inter, sans-serif" font-size="18">FRONT</text>
    <svg x="0" y="0" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
      {FRONT_SVG.split('<svg')[1].split('>', 1)[1].rsplit('</svg>', 1)[0]}
    </svg>
  </g>

  <!-- Back -->
  <g transform="translate(1350,120)">
    <rect width="{CARD_W}" height="{CARD_H}" fill="#000" stroke="#333" stroke-width="2"/>
    <text x="0" y="-15" fill="#888" font-family="Inter, sans-serif" font-size="18">BACK</text>
    <svg x="0" y="0" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
      {BACK_SVG.split('<svg')[1].split('>', 1)[1].rsplit('</svg>', 1)[0]}
    </svg>
  </g>

  <!-- Mockup preview -->
  <g transform="translate(150,820)">
    <text x="0" y="0" fill="#888" font-family="Inter, sans-serif" font-size="18">PREVIEW (stacked)</text>
    <g transform="translate(0,30) rotate(-3)">
      <rect width="{CARD_W}" height="{CARD_H}" fill="#000" stroke="#444" stroke-width="1" rx="8"/>
      <svg x="0" y="0" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
        {FRONT_SVG.split('<svg')[1].split('>', 1)[1].rsplit('</svg>', 1)[0]}
      </svg>
    </g>
    <g transform="translate(40,50) rotate(2)">
      <rect width="{CARD_W}" height="{CARD_H}" fill="#000" stroke="#444" stroke-width="1" rx="8"/>
      <svg x="0" y="0" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
        {BACK_SVG.split('<svg')[1].split('>', 1)[1].rsplit('</svg>', 1)[0]}
      </svg>
    </g>
  </g>
</svg>
"""
).strip()


def render_svg(svg: str, path: Path, width: int | None = None, height: int | None = None) -> None:
    kwargs: dict = {"bytestring": svg.encode("utf-8"), "write_to": str(path)}
    if width:
        kwargs["output_width"] = width
    if height:
        kwargs["output_height"] = height
    cairosvg.svg2png(**kwargs)
    print(f"  ✓ {path.name}")


def main() -> None:
    assets = {
        "apex-business-card-logo.svg": LOGO_SVG,
        "apex-business-card-front.svg": FRONT_SVG,
        "apex-business-card-back.svg": BACK_SVG,
        "apex-business-card-print-sheet.svg": PRINT_SHEET_SVG,
    }

    print("Writing SVG assets...")
    for name, content in assets.items():
        path = OUTPUT_DIR / name
        path.write_text(content, encoding="utf-8")
        print(f"  ✓ {name}")

    print("\nRendering PNG assets...")
    render_svg(LOGO_SVG, OUTPUT_DIR / "apex-business-card-logo.png", 840, 960)
    render_svg(FRONT_SVG, OUTPUT_DIR / "apex-business-card-front.png", CARD_W, CARD_H)
    render_svg(BACK_SVG, OUTPUT_DIR / "apex-business-card-back.png", CARD_W, CARD_H)
    render_svg(PRINT_SHEET_SVG, OUTPUT_DIR / "apex-business-card-print-sheet.png", 2550, 1650)

    print("\nDone! Files saved to attached_assets/")


if __name__ == "__main__":
    main()
