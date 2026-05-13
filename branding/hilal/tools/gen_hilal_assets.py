#!/usr/bin/env python3
"""Generate all Hilal Browser raster branding assets from PNGs already
rendered from SVGs by `qlmanage`.

Inputs (in branding/hilal/_raster/ or browser/branding/hilal/_raster/):
    logo-{16,22,24,32,48,64,70,128,150,256,512,1024}.png

Outputs (in the selected Hilal branding directory and its content/ folder):
    default{16,22,24,32,48,64,128,256}.png
    VisualElements_{70,150}.png, PrivateBrowsing_{70,150}.png
    background.png (DMG background)
    firefox.icns, document.icns, disk.icns
    firefox.ico, firefox64.ico, document.ico, document_pdf.ico,
    newtab.ico, newwindow.ico, pbmode.ico
    wizHeader.bmp, wizHeaderRTL.bmp, wizWatermark.bmp
    content/about-logo.png, content/about-logo@2x.png,
    content/about-logo-private.png, content/about-logo-private@2x.png,
    content/about.png
"""
from __future__ import annotations
import os, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

def find_brand_dir() -> Path:
    for candidate in (Path("branding/hilal"), Path("browser/branding/hilal")):
        if candidate.exists():
            return candidate
    return Path("browser/branding/hilal")


BRAND_DIR = find_brand_dir()
RASTER = BRAND_DIR / "_raster"
CONTENT = BRAND_DIR / "content"

MIDNIGHT = (18, 24, 38, 255)     # #121826 - installer bg
GOLD = (247, 201, 72, 255)       # #F7C948 - crescent
CYAN = (95, 212, 230, 255)       # #5FD4E6 - secondary accent
WHITE = (255, 255, 255, 255)
PURPLE = (120, 71, 209)          # #7847D1 – private browsing accent


def open_logo(size: int) -> Image.Image:
    """Load the pre-rendered logo for `size`, falling back to the next
    larger source and downsampling with high quality."""
    candidates = [size, 256, 512, 1024, 150, 128, 64]
    for c in candidates:
        p = RASTER / f"logo-{c}.png"
        if p.exists():
            img = Image.open(p).convert("RGBA")
            if img.size != (size, size):
                img = img.resize((size, size), Image.LANCZOS)
            return img
    raise FileNotFoundError(f"No source PNG for size {size}")


def tint_private(img: Image.Image) -> Image.Image:
    """Recolor the crescent for private browsing."""
    r, g, b, a = img.split()
    # Simple hue shift via grayscale luminance, then multiply by purple ramp.
    luma = ImageOps.grayscale(img)
    # Compose purple-tinted layer.
    base = Image.new("RGBA", img.size, (35, 18, 70, 255))  # deep purple bg
    overlay = Image.new("RGBA", img.size, PURPLE + (0,))
    # Use luminance as alpha mask, accenting brighter areas in purple.
    overlay.putalpha(luma)
    out = Image.alpha_composite(base, overlay)
    # Preserve the original alpha so the crescent remains transparent.
    out.putalpha(a)
    return out


def make_bg(width: int, height: int, color=MIDNIGHT) -> Image.Image:
    img = Image.new("RGBA", (width, height), color)
    # Subtle radial vignette using diagonal gradient.
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(20):
        a = int(255 * (i / 20) * 0.05)
        d.rectangle([i, i, width - i, height - i], outline=(255, 255, 255, a))
    return Image.alpha_composite(img, overlay)


def composite_on(bg: Image.Image, fg: Image.Image, scale=0.8, dy=0) -> Image.Image:
    w, h = bg.size
    s = int(min(w, h) * scale)
    fg2 = fg.resize((s, s), Image.LANCZOS)
    x = (w - s) // 2
    y = (h - s) // 2 + dy
    out = bg.copy()
    out.alpha_composite(fg2, (x, y))
    return out


def save_ico(path: Path, sizes: list[int]):
    base = open_logo(max(sizes))
    layers = [base.resize((s, s), Image.LANCZOS) for s in sizes]
    layers[0].save(path, format="ICO", sizes=[(s, s) for s in sizes],
                   append_images=layers[1:])


def save_doc_ico(path: Path, label: str, sizes: list[int]):
    """A simple document icon: navy page with cyan band + label."""
    imgs = []
    for s in sizes:
        img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        margin = max(1, s // 16)
        # Page
        d.rounded_rectangle(
            [margin, margin, s - margin, s - margin],
            radius=max(2, s // 16), fill=(240, 243, 248, 255),
            outline=MIDNIGHT[:3] + (255,), width=max(1, s // 32))
        # Folded corner
        fc = s // 4
        d.polygon([(s - margin - fc, margin), (s - margin, margin + fc),
                   (s - margin - fc, margin + fc)],
                  fill=(200, 210, 225, 255))
        # Cyan band with label
        band_h = max(4, s // 6)
        band_y = s // 2 - band_h // 2
        d.rounded_rectangle(
            [s // 5, band_y, 4 * s // 5, band_y + band_h],
            radius=max(2, s // 32), fill=CYAN[:3] + (255,))
        # Draw label if size is large enough
        if s >= 32:
            try:
                font = ImageFont.truetype(
                    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                    max(8, band_h - max(2, s // 20)))
                bbox = d.textbbox((0, 0), label, font=font)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                d.text(((s - tw) // 2, band_y + (band_h - th) // 2 - bbox[1]),
                       label, fill=WHITE, font=font)
            except Exception:
                pass
        imgs.append(img)
    # Save largest first; Pillow stores append_images at their own sizes.
    imgs_sorted = sorted(imgs, key=lambda im: -im.size[0])
    imgs_sorted[0].save(path, format="ICO",
                        sizes=[im.size for im in imgs_sorted],
                        append_images=imgs_sorted[1:])


def save_icns_macos(path: Path, source_png_for_size):
    """Use macOS iconutil to assemble an .icns from an iconset directory."""
    with tempfile.TemporaryDirectory() as tmp:
        iconset = Path(tmp) / "Hilal.iconset"
        iconset.mkdir()
        spec = [
            (16, False), (16, True), (32, False), (32, True),
            (128, False), (128, True), (256, False), (256, True),
            (512, False), (512, True),
        ]
        for size, retina in spec:
            actual = size * 2 if retina else size
            name = f"icon_{size}x{size}{'@2x' if retina else ''}.png"
            img = source_png_for_size(actual)
            img.save(iconset / name)
        subprocess.run(["iconutil", "-c", "icns", str(iconset),
                        "-o", str(path)], check=True)


def make_wiz_banner(path: Path, width: int, height: int, with_logo=True,
                    rtl=False):
    bg = make_bg(width, height)
    if with_logo:
        logo = open_logo(min(height, 256)).resize(
            (height - 8, height - 8), Image.LANCZOS)
        x = 8 if not rtl else width - logo.width - 8
        bg.alpha_composite(logo, (x, 4))
    bg.convert("RGB").save(path, format="BMP")


def main():
    assert BRAND_DIR.exists(), f"Run from repo root; missing {BRAND_DIR}"
    CONTENT.mkdir(exist_ok=True)

    # --- Default toolkit icons (Linux + chrome jar) ---
    for size in (16, 22, 24, 32, 48, 64, 128, 256):
        open_logo(size).save(BRAND_DIR / f"default{size}.png")

    # --- Windows VisualElements tiles ---
    for size, name in [(70, "VisualElements_70.png"),
                       (150, "VisualElements_150.png")]:
        tile = make_bg(size, size)
        logo = open_logo(int(size * 0.7))
        x = (size - logo.width) // 2
        y = (size - logo.height) // 2
        tile.alpha_composite(logo, (x, y))
        tile.save(BRAND_DIR / name)

    # Private browsing tiles: purple tint
    for size, name in [(70, "PrivateBrowsing_70.png"),
                       (150, "PrivateBrowsing_150.png")]:
        tile = make_bg(size, size, color=(45, 20, 80, 255))
        logo = tint_private(open_logo(int(size * 0.7)))
        x = (size - logo.width) // 2
        y = (size - logo.height) // 2
        tile.alpha_composite(logo, (x, y))
        tile.save(BRAND_DIR / name)

    # --- DMG background ---
    bg = make_bg(660, 400)
    bg.convert("RGB").save(BRAND_DIR / "background.png")

    # --- about-logo PNGs (content/) ---
    open_logo(128).save(CONTENT / "about-logo.png")
    open_logo(256).save(CONTENT / "about-logo@2x.png")
    open_logo(512).save(CONTENT / "about.png")
    tint_private(open_logo(128)).save(CONTENT / "about-logo-private.png")
    tint_private(open_logo(256)).save(CONTENT / "about-logo-private@2x.png")

    # --- ICNS files (macOS) ---
    save_icns_macos(BRAND_DIR / "firefox.icns", open_logo)

    def doc_icon_for_size(size, label="DOC"):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        m = max(1, size // 16)
        d.rounded_rectangle([m, m, size - m, size - m],
                            radius=max(2, size // 16),
                            fill=(240, 243, 248, 255),
                            outline=MIDNIGHT[:3] + (255,),
                            width=max(1, size // 32))
        fc = size // 4
        d.polygon([(size - m - fc, m), (size - m, m + fc),
                   (size - m - fc, m + fc)], fill=(200, 210, 225, 255))
        band_h = max(4, size // 6)
        band_y = size // 2 - band_h // 2
        d.rounded_rectangle(
            [size // 5, band_y, 4 * size // 5, band_y + band_h],
            radius=max(2, size // 32), fill=CYAN[:3] + (255,))
        if size >= 32:
            try:
                font = ImageFont.truetype(
                    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
                    max(8, band_h - max(2, size // 20)))
                bbox = d.textbbox((0, 0), label, font=font)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                d.text(((size - tw) // 2,
                        band_y + (band_h - th) // 2 - bbox[1]),
                       label, fill=WHITE, font=font)
            except Exception:
                pass
        return img

    save_icns_macos(BRAND_DIR / "document.icns",
                    lambda s: doc_icon_for_size(s, "DOC"))

    # Disk icon (DMG volume): crescent on transparent bg, identical to firefox.icns
    save_icns_macos(BRAND_DIR / "disk.icns", open_logo)

    # --- ICO files (Windows) ---
    save_ico(BRAND_DIR / "firefox.ico", [16, 24, 32, 48, 64, 128, 256])
    save_ico(BRAND_DIR / "firefox64.ico", [16, 24, 32, 48, 64])
    save_ico(BRAND_DIR / "newtab.ico", [16, 24, 32, 48])
    save_ico(BRAND_DIR / "newwindow.ico", [16, 24, 32, 48])

    # Private mode ico: tinted
    pb_layers = []
    for s in (16, 24, 32, 48):
        pb_layers.append(tint_private(open_logo(s)))
    pb_layers[0].save(BRAND_DIR / "pbmode.ico", format="ICO",
                      sizes=[(s, s) for s in (16, 24, 32, 48)],
                      append_images=pb_layers[1:])

    save_doc_ico(BRAND_DIR / "document.ico", "DOC", [16, 24, 32, 48, 64])
    save_doc_ico(BRAND_DIR / "document_pdf.ico", "PDF", [16, 24, 32, 48, 64])

    # --- NSIS installer BMPs ---
    make_wiz_banner(BRAND_DIR / "wizHeader.bmp", 150, 57)
    make_wiz_banner(BRAND_DIR / "wizHeaderRTL.bmp", 150, 57, rtl=True)
    # Watermark is a tall side image
    wm = make_bg(164, 314)
    logo = open_logo(120)
    wm.alpha_composite(logo, ((164 - 120) // 2, 40))
    wm.convert("RGB").save(BRAND_DIR / "wizWatermark.bmp", format="BMP")

    print("OK — Hilal assets generated.")


if __name__ == "__main__":
    main()
