#!/usr/bin/env python3
"""Renders 1200x630 social share (Open Graph) images for every page.

For each HTML page whose og:image points at /assets/og/<name>.png, this draws that image
from the page's H1 if the file doesn't exist yet. Run with --force to redraw all of them
(e.g. after changing the design or a page's H1).

    pip install pillow
    python3 scripts/seo/og-images.py [--force]

The Build Insights workflow runs it after building posts, so new posts get an image automatically.
"""
import html
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS = os.path.join(os.path.dirname(__file__), 'fonts')
OUT = os.path.join(ROOT, 'assets', 'og')
W, H = 1200, 630
BG, SURFACE, TEXT, MUTED, ACCENT = '#020C24', '#071A45', '#f5f7fa', '#A9B6D3', '#19D3FF'
SKIP_DIRS = {'.git', 'node_modules', 'scripts', 'content', 'assets', '.github'}

SECTIONS = [
    ('index.html', 'Strategy · Operations · Data · Growth'),
    ('insights/', 'Insights'), ('services/', 'Services'), ('industries/', 'Industries'),
    ('ai-visibility-check', 'Free tool'), ('growth-check', 'Free tool'), ('website-enquiry', 'Free tool'),
    ('partners', 'Partner program'), ('labs', 'Labs'), ('sample-intelligence', 'Sample brief'), ('samples', 'Sample report'), ('use-cases', 'Use case'),
]


def section_for(rel):
    for prefix, label in SECTIONS:
        if rel.startswith(prefix):
            return label
    return 'AI growth consulting'


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def wrap(draw, text, fnt, width):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if draw.textlength(trial, font=fnt) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def render(headline, eyebrow, dest):
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    # soft accent panel and bar
    d.rounded_rectangle((W - 330, -80, W + 80, 260), radius=60, fill=SURFACE)
    d.rectangle((0, 0, 14, H), fill=ACCENT)

    logo = Image.open(os.path.join(ROOT, 'assets', 'marketcentaur-logo-transparent.png')).convert('RGBA')
    logo = logo.crop(logo.getbbox())
    lh = 104
    logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
    img.paste(logo, (72, 56), logo)

    d.text((72, 196), eyebrow.upper(), font=font('Inter-Medium.otf', 26), fill=ACCENT)

    # largest size at which the headline fits in 3 lines
    for size in (72, 66, 60, 54, 48, 44):
        fnt = font('Inter-Bold.otf', size)
        lines = wrap(d, headline, fnt, W - 72 - 90)
        if len(lines) <= 3:
            break
    lines = lines[:3]
    y = 240
    for ln in lines:
        d.text((72, y), ln, font=fnt, fill=TEXT)
        y += int(size * 1.18)

    d.line((72, H - 92, 200, H - 92), fill=ACCENT, width=4)
    d.text((72, H - 72), 'marketcentaur.com', font=font('Inter-Medium.otf', 26), fill=MUTED)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img.save(dest, optimize=True)


def pages():
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
        for f in files:
            if f.endswith('.html'):
                p = os.path.join(dirpath, f)
                yield os.path.relpath(p, ROOT).replace(os.sep, '/'), p


def main():
    force = '--force' in sys.argv
    made = 0
    for rel, p in sorted(pages()):
        s = open(p, encoding='utf-8').read()
        m = re.search(r'<meta property="og:image" content="https://marketcentaur\.com/assets/og/([a-z0-9-]+\.png)"', s)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
        if not m or not h1:
            continue
        dest = os.path.join(OUT, m.group(1))
        if os.path.exists(dest) and not force:
            continue
        headline = html.unescape(re.sub(r'<[^>]+>', '', h1.group(1))).strip()
        render(headline, section_for(rel), dest)
        made += 1
        print(f'og image: assets/og/{m.group(1)}  <- {rel}')
    print(f'Rendered {made} Open Graph image(s).')


if __name__ == '__main__':
    main()
