"""Builds public/brand/svc-emblem-hd.png: the logo emblem, super-resolved.

The only emblem artwork available is 71x108 px. It was upscaled 16x with
Real-ESRGAN (RealESRGAN_x4plus, applied twice) on a white ground; this script
rebuilds the transparency from the original alpha plus the white ground.
Replace with SVC's official high-resolution logo when it is supplied.
Usage: python scripts/make_hd_emblem.py <super-resolved.png>
"""
import sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageFilter

SRC = "public/brand/svc-emblem.png"
OUT = "public/brand/svc-emblem-hd.png"
TARGET_H = 1600

sr = Image.open(sys.argv[1]).convert("RGB")
W, H = sr.size
alpha_src = Image.open(SRC).convert("RGBA").split()[3]
a = np.asarray(alpha_src.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
rgb = np.asarray(sr).astype(np.float32)
minc = rgb.min(axis=2)

# Transparent = white ground that is connected to genuinely empty pixels of the
# original. Enclosed white details (the namam on the forehead) stay solid.
white = minc > 212
seeds = a < 0.05
labels, _ = ndimage.label(white | seeds)
keep = np.unique(labels[seeds & (labels > 0)])
empty = np.isin(labels, keep) & (labels > 0)
# The namam (white forehead mark) is semi-transparent in the source logo; keep it solid.
# Box in super-resolved (16x) pixel coordinates.
NAMAM = (500, 605, 615, 720)  # x0, y0, x1, y1
empty[NAMAM[1]:NAMAM[3], NAMAM[0]:NAMAM[2]] = False
# Soft edge: within a few px of the empty region, fade by how white the pixel is.
near = ndimage.binary_dilation(empty, iterations=4) & ~empty
by_colour = np.clip((238.0 - minc) / 38.0, 0, 1)
alpha = np.where(empty, 0.0, np.where(near, by_colour, 1.0))
alpha_img = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))

out = Image.merge("RGBA", (*sr.split(), alpha_img))
out = out.resize((round(W * TARGET_H / H), TARGET_H), Image.LANCZOS)
out.save(OUT, optimize=True)
print(OUT, out.size)
