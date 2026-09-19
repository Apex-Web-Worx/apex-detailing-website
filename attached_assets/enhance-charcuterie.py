#!/usr/bin/env python3
"""Enhance the user's charcuterie photo and remove grapes (top-left cluster)."""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ASSETS = Path(__file__).parent
INPUT_NAMES = [
    "charcuterie-original.png",
    "charcuterie-original.jpg",
    "charcuterie-original.jpeg",
    "charcuterie-original.webp",
]
OUTPUT = ASSETS / "charcuterie-edited.png"


def find_input() -> Path:
    for name in INPUT_NAMES:
        path = ASSETS / name
        if path.exists():
            return path
    raise FileNotFoundError(
        "Original not found. Save your screenshot as:\n"
        "  attached_assets/charcuterie-original.png\n"
        "Then run: python3 attached_assets/enhance-charcuterie.py"
    )


def remove_grapes(img_bgr: np.ndarray) -> np.ndarray:
    h, w = img_bgr.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    # Top-left grape cluster area (tuned for typical board layout)
    x1, y1 = int(w * 0.02), int(h * 0.02)
    x2, y2 = int(w * 0.42), int(h * 0.28)
    cv2.ellipse(mask, ((x1 + x2) // 2, (y1 + y2) // 2), ((x2 - x1) // 2, (y2 - y1) // 2), 0, 0, 360, 255, -1)

    # Green grape tone mask inside region for safer inpaint
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    green = cv2.inRange(hsv, (35, 40, 40), (90, 255, 255))
    grape_mask = cv2.bitwise_and(mask, green)

    # Expand slightly if green mask is sparse
    if cv2.countNonZero(grape_mask) < 500:
        grape_mask = mask

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    grape_mask = cv2.dilate(grape_mask, kernel, iterations=2)

    return cv2.inpaint(img_bgr, grape_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)


def enhance(img_rgb: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img_rgb).enhance(1.04)
    img = ImageEnhance.Contrast(img).enhance(1.10)
    img = ImageEnhance.Color(img).enhance(1.14)
    img = ImageEnhance.Sharpness(img).enhance(1.35)
    return img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=140, threshold=2))


def main() -> None:
    src = find_input()
    bgr = cv2.imread(str(src))
    if bgr is None:
        raise RuntimeError(f"Could not read image: {src}")

    cleaned = remove_grapes(bgr)
    rgb = cv2.cvtColor(cleaned, cv2.COLOR_BGR2RGB)
    result = enhance(Image.fromarray(rgb))
    result.save(OUTPUT, quality=95, optimize=True)
    print(f"Input:  {src}")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
