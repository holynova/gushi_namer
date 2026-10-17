#!/usr/bin/env python3
"""Generate 1200x630 OG image for holynova.github.io/gushi_namer (古诗文起名).

Classical ink-on-paper aesthetic: warm paper ground, vertical classical-poetry
columns, large site title, red seal accent. Pillow-only + wqy-zenhei CJK font.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
PAPER = (248, 244, 234)      # warm rice paper
INK = (38, 34, 30)           # near-black ink
RED = (189, 54, 47)          # seal red
GREY = (110, 100, 88)        # muted ink grey
LINEGREY = (222, 214, 198)   # faint ruling lines

FONT_CJK = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
FONT_LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def font(size, cjk=True):
    p = FONT_CJK if cjk else FONT_LATIN
    if os.path.exists(p):
        return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def text_w(d, cx, y, text, fnt, fill):
    bbox = d.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], y - bbox[1]), text, font=fnt, fill=fill)
    return tw, th

def vtext(d, x, y, text, fnt, fill, line_h=None):
    """Draw text vertically (one char per line, top-down) from (x,y)."""
    if line_h is None:
        line_h = int(fnt.size * 1.25)
    bbox = d.textbbox((0, 0), "永", font=fnt)
    for ch in text:
        d.text((x - (bbox[2] - bbox[0]) / 2 - bbox[0], y - bbox[1]), ch, font=fnt, fill=fill)
        y += line_h

def main():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # faint horizontal ruling lines (classical manuscript feel)
    for yy in range(60, H, 32):
        d.line([(40, yy), (W - 40, yy)], fill=LINEGREY, width=1)

    # thin double border
    d.rectangle([18, 18, W - 18, H - 18], outline=INK, width=2)
    d.rectangle([30, 30, W - 30, H - 30], outline=GREY, width=1)

    # left: vertical classical columns (诗经 楚辞 唐诗 宋词)
    f_col = font(30)
    vtext(d, 150, 90, "诗", f_col, GREY, line_h=44)
    vtext(d, 150, 320, "经", f_col, RED, line_h=44)
    vtext(d, 235, 90, "楚", f_col, GREY, line_h=44)
    vtext(d, 235, 320, "辞", f_col, RED, line_h=44)
    vtext(d, 320, 90, "唐", f_col, GREY, line_h=44)
    vtext(d, 320, 320, "诗", f_col, RED, line_h=44)
    vtext(d, 405, 90, "宋", f_col, GREY, line_h=44)
    vtext(d, 405, 320, "词", f_col, RED, line_h=44)

    # center: title 古诗文起名
    f_title = font(96)
    text_w(d, 690, 150, "古诗文起名", f_title, INK)

    # accent char on a red seal at right of title
    seal_size = 92
    d.rounded_rectangle([1020, 140, 1020 + seal_size, 140 + seal_size], radius=10, fill=RED)
    f_seal = font(56)
    text_w(d, 1020 + seal_size / 2, 140 + (seal_size - 56) / 2 + 6, "名", f_seal, PAPER)

    # subtitle
    f_sub = font(40)
    text_w(d, 690, 300, "翻阅经典，遇见好名字", f_sub, GREY)

    # bottom line: sources
    f_src = font(26)
    text_w(d, 690, 430, "从《诗经》《楚辞》、唐诗宋词中随机取字", f_src, GREY)
    text_w(d, 690, 480, "为名字保留出处与原文", f_src, GREY)

    # domain
    f_dom = font(24, cjk=False)
    text_w(d, 690, 560, "holynova.github.io/gushi_namer/", f_dom, INK)

    out = "og-image.png"
    img.save(out, "PNG")
    print("wrote", out, img.size)

if __name__ == "__main__":
    main()