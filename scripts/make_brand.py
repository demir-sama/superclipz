"""Generate brand assets.
Usage: python3 scripts/make_brand.py [path/to/logo.png]
- copies the original logo to public/brand/logo.png
- writes public/brand/logo-dark.png: white bg -> transparent, black wordmark -> white
"""
import sys, shutil
from PIL import Image
src = sys.argv[1] if len(sys.argv) > 1 else 'public/brand/logo.png'
if src != 'public/brand/logo.png':
    shutil.copy(src, 'public/brand/logo.png')
im = Image.open('public/brand/logo.png').convert('RGBA')
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        lo, hi = min(r, g, b), max(r, g, b)
        if lo > 235:                      # white background -> transparent
            px[x, y] = (255, 255, 255, 0)
        elif hi < 70:                     # black wordmark -> white
            px[x, y] = (255, 255, 255, a)
        elif hi - lo < 25 and lo > 180:   # light anti-aliased edge -> fade out
            px[x, y] = (255, 255, 255, int(a * (255 - lo) / 75))
        elif hi - lo < 25 and hi < 180:   # grey anti-aliasing on text -> light
            v = 255 - lo
            px[x, y] = (255, 255, 255, int(a * v / 255))
im.save('public/brand/logo-dark.png')
print('ok', im.size)
