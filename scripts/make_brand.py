"""Generate brand assets from lee's logo.
Usage: python3 scripts/make_brand.py [path/to/logo.png]
Outputs (public/brand/):
  logo.png       tight-cropped, transparent background, black wordmark (light mode)
  logo-dark.png  same, wordmark turned white (dark mode)
  icon.png       just the icon (frame + play + sparks), square, transparent
  source.png     untouched original
and public/favicon-32.png, public/apple-touch-icon.png, public/icon-512.png
"""
import sys, shutil
import numpy as np
from PIL import Image

src = sys.argv[1] if len(sys.argv) > 1 else 'public/brand/source.png'
if src != 'public/brand/source.png':
    shutil.copy(src, 'public/brand/source.png')
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)

# colour-to-alpha against white: alpha = how far the darkest channel is from white
alpha = (255 - rgb.min(axis=2)) / 255
alpha[alpha < 0.10] = 0                          # kill faint background noise/jpeg haze
alpha = np.clip((alpha - 0.10) / 0.90, 0, 1)     # re-stretch
a = np.maximum(alpha, 1e-6)[..., None]
col = np.clip((rgb - 255 * (1 - a)) / a, 0, 255)

ys, xs = np.where(alpha > 0.3)
pad = 12
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, rgb.shape[0])
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, rgb.shape[1])
col, alpha = col[y0:y1, x0:x1], alpha[y0:y1, x0:x1]

def save(c, al, path):
    Image.fromarray(np.dstack([c, al * 255]).astype(np.uint8), 'RGBA').save(path, optimize=True)

save(col, alpha, 'public/brand/logo.png')

# dark mode: neutral dark pixels (the wordmark) -> white
sat = col.max(axis=2) - col.min(axis=2)
dark_text = (sat < 60) & (col.max(axis=2) < 140)
dcol = col.copy(); dcol[dark_text] = 255
save(dcol, alpha, 'public/brand/logo-dark.png')

# icon = content left of the first wide empty column gap (between icon and wordmark)
occ = (alpha > 0.3).any(axis=0)
xs_occ = np.where(occ)[0]
gaps = np.where(np.diff(xs_occ) > 8)[0]
cut = xs_occ[gaps[0]] + 1 if len(gaps) else alpha.shape[1]
ic, ia = col[:, :cut], alpha[:, :cut]
ys2, xs2 = np.where(ia > 0.3)
ic, ia = ic[ys2.min():ys2.max() + 1, xs2.min():xs2.max() + 1], ia[ys2.min():ys2.max() + 1, xs2.min():xs2.max() + 1]
h, w = ia.shape; s = int(max(h, w) * 1.08)
canvas = Image.new('RGBA', (s, s), (0, 0, 0, 0))
canvas.paste(Image.fromarray(np.dstack([ic, ia * 255]).astype(np.uint8), 'RGBA'), ((s - w) // 2, (s - h) // 2))
canvas.save('public/brand/icon.png')
for size, path in [(32, 'public/favicon-32.png'), (512, 'public/icon-512.png')]:
    canvas.resize((size, size), Image.LANCZOS).save(path)
apple = Image.new('RGBA', (180, 180), 'white'); apple.alpha_composite(canvas.resize((160, 160), Image.LANCZOS), (10, 10))
apple.convert('RGB').save('public/apple-touch-icon.png')
print('logo', col.shape[1], 'x', col.shape[0], '| icon', s, 'px | cut at x =', cut)
