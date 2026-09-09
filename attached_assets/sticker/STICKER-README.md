# Apex Detailing — Bumper QR sticker

Horizontal bumper badge in the same spot as the Cerakote plate. A QR code on the left opens **https://www.apexdetailing.net**. The site, phone, and “SCAN TO BOOK” sit on the right.

## Files to print

| File | Use |
| --- | --- |
| `bumper/apex-bumper-qr-8x3.png` | **Main print file** — 8" × 3" @ 300 DPI, transparent outside the kiss-cut |
| `bumper/apex-bumper-qr-10x35.png` | Larger 10" × 3.5" version if you want an easier scan from farther away |
| `bumper/apex-bumper-qr-print-sheet.png` | Two-up on landscape US Letter with crop marks |
| `bumper/apex-qr-apexdetailing-net.png` | Standalone QR (same URL) |
| `bumper/apex-qr-apexdetailing-net.svg` | Vector QR |

## Mockups

- `bumper/apex-bumper-qr-car-hero.jpg` — rear bumper photo
- `bumper/apex-bumper-qr-on-car.jpg` — overlay on the bumper photo you sent
- `bumper/apex-bumper-qr-studio.jpg` — studio artwork

Open `bumper-preview.html` locally to review.

## Print specs

- **Size:** 8" wide × 3" tall (QR is about 2" — scannable from a few feet)
- **Cut:** custom die / kiss-cut on the outer white edge
- **Stock:** outdoor vinyl + UV laminate, gloss
- **QR:** high error correction, encodes `https://www.apexdetailing.net`

Regenerate after edits:

```bash
python3 attached_assets/sticker/generate-bumper-sticker.py
```
