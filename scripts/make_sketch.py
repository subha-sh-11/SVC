import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

# Usage: python scripts/make_sketch.py <source.jpg> <out.png> <preview.jpg>
src, out, preview = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGB")
# Soften the faint forehead watermark before anything else.
box = (1125, 695, 1262, 780)
im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(9)), box[:2])
# Head-and-shoulders crop, clear of the large watermark lower down.
im = im.crop((320, 170, 1600, 1480))
gray = ImageOps.autocontrast(im.convert("L").filter(ImageFilter.MedianFilter(5)), cutoff=1)
g = np.asarray(gray).astype(np.float32)

# Pencil lines: colour-dodge of the image with its blurred negative.
inv = Image.fromarray((255 - g).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14))
b = np.asarray(inv).astype(np.float32)
lines = np.clip(g * 255.0 / np.maximum(255.0 - b, 1.0), 0, 255)

# Ink wash: keep the deep shadows (hair, eyes) as solid tone.
tone = np.clip((g - 20.0) / (175.0 - 20.0), 0, 1) ** 0.9
wash = 255 * (0.35 + 0.65 * tone)
final = np.minimum(lines, 255) * (wash / 255.0)
final = np.clip((final - 30) / (245 - 30), 0, 1) * 255  # levels

dark = 255.0 - final
h, w = dark.shape
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
# Fade the body out toward the bottom and the sides, like an ink portrait.
fade_y = np.clip((0.97 - yy / h) / (0.97 - 0.6), 0, 1) ** 1.4
cx, cy = w * 0.5, h * 0.42
r = np.sqrt(((xx - cx) / (w * 0.5)) ** 2 + ((yy - cy) / (h * 0.7)) ** 2)
fade_r = np.clip((1.0 - r) / 0.3, 0, 1)
# Hard guarantee: nothing survives in the outer 6% on the left and right.
edge = np.clip(np.minimum(xx, w - 1 - xx) / (w * 0.06), 0, 1)
fade_r = fade_r * edge
# Drop faint background marks (wall edges) so only the figure remains.
dark = np.clip((dark - 24.0) * 255.0 / (255.0 - 24.0), 0, 255)
alpha = np.clip(dark * fade_y * fade_r, 0, 255)

ink = np.zeros((h, w, 4), dtype=np.uint8)
ink[..., 0], ink[..., 1], ink[..., 2] = 30, 10, 14  # maroon-black ink
ink[..., 3] = alpha.astype(np.uint8)
out_im = Image.fromarray(ink, "RGBA")
out_im = out_im.resize((1000, round(1000 * h / w)), Image.LANCZOS)
out_im.save(out, optimize=True)
bg = Image.new("RGBA", out_im.size, (255, 255, 255, 255))
bg.alpha_composite(out_im)
bg.convert("RGB").save(preview)
print(out_im.size)
