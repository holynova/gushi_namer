"""Render the README card: pip install Pillow qrcode; python scripts/render_demo_share_card.py.
Uses the product palette from src/App.tsx and src/components/NameCard.tsx.
Override GUSHI_CARD_FONT with a Chinese font path when Songti is unavailable.
"""
from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont
import qrcode

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://gushi-namer.xiaosang.cc/'
W, H, SCALE = 1080, 1440, 2
COLORS = dict(bg='#F7F0E4', card='#FFFDF8', green='#2F765C', dark_green='#1F5F4A',
              red='#B85B4D', ink='#28231D', muted='#6D6257', border='#D7C7AF')
FONT = os.environ.get('GUSHI_CARD_FONT', '/System/Library/Fonts/Supplemental/Songti.ttc')
FONT_INDEX = 6 if FONT.endswith('Songti.ttc') else 0
FONT_BOLD = 1 if FONT.endswith('Songti.ttc') else 0
SANS = '/System/Library/Fonts/Supplemental/Arial.ttf'
if not Path(SANS).exists():
    SANS = FONT
im = Image.new('RGB', (W*SCALE, H*SCALE), COLORS['bg'])
d = ImageDraw.Draw(im)
def box(b, fill=None, outline=None, width=1, radius=0):
    b = tuple(round(v*SCALE) for v in b)
    if radius:
        d.rounded_rectangle(b, radius*SCALE, fill=fill, outline=outline, width=width*SCALE)
    else:
        d.rectangle(b, fill=fill, outline=outline, width=width*SCALE)
def text(x, y, s, size, color, bold=False, sans=False):
    face = SANS if sans else FONT
    font = ImageFont.truetype(face, size*SCALE, index=0 if sans else (FONT_BOLD if bold else FONT_INDEX))
    # lt aligns the visible glyph to its intended top edge.
    d.text((x*SCALE, y*SCALE), s, font=font, fill=color, anchor='lt')
def line(y, x1=98, x2=982, color=None, width=1):
    d.line((x1*SCALE,y*SCALE,x2*SCALE,y*SCALE), fill=color or COLORS['border'], width=width*SCALE)

box((42,42,1038,1398),fill=COLORS['card'],outline=COLORS['border'],radius=16)
text(98,103,'G U S H I   N A M E R',25,COLORS['red'],sans=True)
text(94,170,'古诗文起名',84,COLORS['green'],bold=True)
# The red accent echoes the site's primary action.
box((892,96,982,186),outline=COLORS['red'],width=2,radius=5)
text(912,111,'取',29,COLORS['red'],bold=True)
text(912,146,'名',29,COLORS['red'],bold=True)
line(296)

text(94,365,'翻阅经典',102,COLORS['ink'],bold=True)
text(94,500,'遇见好名字',102,COLORS['dark_green'],bold=True)
box((98,650,172,656),fill=COLORS['red'])
text(98,704,'从古诗文中取字，',39,COLORS['muted'])
text(98,763,'为每个名字保留原文与出处。',39,COLORS['muted'])
text(98,854,'诗经  ·  楚辞  ·  唐诗  ·  宋词',32,COLORS['green'])
line(934)

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=16,border=4)
qr.add_data(URL); qr.make(fit=True)
qr_img = qr.make_image(fill_color=COLORS['dark_green'],back_color=COLORS['card']).convert('RGB')
# Keep QR modules on integer pixel boundaries in the release image.
qr_small = qr_img.resize((300*SCALE,300*SCALE),Image.Resampling.NEAREST)
im.paste(qr_small,(96*SCALE,978*SCALE))
text(456,1010,'扫码试试',53,COLORS['dark_green'],bold=True)
text(456,1080,'你的名字',53,COLORS['dark_green'],bold=True)
text(456,1174,'gushi-namer.xiaosang.cc',28,COLORS['muted'],sans=True)

line(1305)
text(98,1340,'翻阅经典，与一个好名字不期而遇。',30,COLORS['muted'])
output = ROOT/'assets/demo-share-card.png'
im.resize((W,H),Image.Resampling.LANCZOS).save(output,optimize=True)
print(output)
print(f'{W} × {H} · PNG · QR → {URL}')
