"""Saves the stills used on the Journey page: public/images/journey/<key>.jpg.

Each is one of YouTube's in-video frames (maxres1-3) of a film's trailer or song video,
chosen by eye, with letterbox bars trimmed and channel logos or lyric credits cropped
away (crop given as fractions of the trimmed frame). Raw frames are cached in
assets/journey_frames/. Which milestone shows which image is in src/data/journeyImages.ts.

Usage: python scripts/fetch_journey_images.py
"""
import io
import os
import urllib.request

import numpy as np
from PIL import Image

CACHE = "assets/journey_frames"
OUT_DIR = "public/images/journey"

# key: (video id, frame 1-3, crop (x0, y0, x1, y1) as fractions or None)
# A channel logo over plain background can be painted out instead (INPAINT, same fractions).
PICKS = {
    "pelli-pandiri-1997": ("t9cgRYweyF0", 1, (0.0, 0.0, 1.0, 0.72)),  # song card: the stars and the title, not the lyric credits
    "oke-okkadu": ("oPTRorYpgxo", 2, None),
    "oke-okkadu-song": ("qO7Tq0ND9QA", 2, None),
    "arya": ("94AW2X8KH9Q", 1, (0.0, 0.0, 0.86, 1.0)),  # without the channel logo at top right
    "munna": ("h1fOJVrBapg", 2, None),
    "bommarillu": ("Yip0FVe1vK0", 3, None),
    "v": ("oD1efgm1RBs", 1, None),
    "varisu": ("9fux9swQ5AQ", 3, None),
    "balagam": ("8R3Vcy5CaPc", 1, None),
    "jersey": ("9hZ2UW6Jv-I", 1, (0.06, 0.07, 1.0, 1.0)),  # without the label logo at top left
    "dil": ("TS1pJodK470", 2, (0.0, 0.0, 0.86, 1.0)),  # Neha in Dil, without the label logo at top right
}


INPAINT = {
    "pelli-pandiri-1997": (0.0, 0.0, 0.135, 0.135),  # the channel logo, over the sky
}


def frame(vid, n):
    os.makedirs(CACHE, exist_ok=True)
    cached = f"{CACHE}/{vid}-{n}.jpg"
    if os.path.exists(cached):
        return Image.open(cached).convert("RGB")
    for size in ("maxres", "sd", "hq"):
        req = urllib.request.Request(f"https://i.ytimg.com/vi/{vid}/{size}{n}.jpg", headers={"User-Agent": "SVC-website-build/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                im = Image.open(io.BytesIO(r.read())).convert("RGB")
        except Exception:
            continue
        if im.width > 200:
            im.save(cached, quality=95)
            return im
    raise SystemExit(f"no frame for {vid} {n}")


def trim_bars(im):
    a = np.asarray(im.convert("L")).astype(float)
    rows = np.where(a.mean(axis=1) > 18)[0]
    cols = np.where(a.mean(axis=0) > 18)[0]
    return im.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for key, (vid, n, crop) in PICKS.items():
        im = trim_bars(frame(vid, n))
        if key in INPAINT:
            import cv2

            w, h = im.size
            x0, y0, x1, y1 = INPAINT[key]
            mask = np.zeros((h, w), np.uint8)
            mask[round(y0 * h) : round(y1 * h), round(x0 * w) : round(x1 * w)] = 255
            a = cv2.inpaint(cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR), mask, 9, cv2.INPAINT_TELEA)
            im = Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))
        if crop:
            w, h = im.size
            im = im.crop((round(crop[0] * w), round(crop[1] * h), round(crop[2] * w), round(crop[3] * h)))
        im.save(f"{OUT_DIR}/{key}.jpg", quality=86, optimize=True, progressive=True)
        print(key, im.size)


if __name__ == "__main__":
    main()
