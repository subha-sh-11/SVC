"""Builds poster-shaped stills for the awards register: public/images/stills/<slug>-<n>.jpg
and src/data/stills.ts.

For every film in the awards register, YouTube's three in-video frames of each of its
videos (maxres1-3, taken a quarter, half and three-quarters of the way in; clean, without
the thumbnails' "TRAILER" lettering) are trimmed of letterbox bars and cut into tall 2:3
crops, one per group of faces OpenCV finds (a centre crop when there are none). Crops are
upscaled 4x with Real-ESRGAN when weights are given, then saved at 800x1200.

Raw frames are cached in assets/award_frames/. Crops listed in SKIP (title cards, logos,
blurred or empty frames, found by eye) are left out.

Usage: python scripts/fetch_award_stills.py [--weights RealESRGAN_x4plus.pth]
"""
import argparse
import io
import json
import os
import re
import sys
import urllib.request

import cv2
import numpy as np
from PIL import Image

CACHE = "assets/award_frames"
OUT_DIR = "public/images/stills"
W_OUT, H_OUT = 800, 1200

# Crops not to use (by output name), with the reason.
_EVENT = "anniversary-event footage, not the film"
SKIP: dict[str, str] = {
    "arya-2004-1": _EVENT, "arya-2004-2": _EVENT, "arya-2004-3": _EVENT, "arya-2004-4": _EVENT,
    "f2-fun-and-frustration-2019-1": "blurred, channel watermark", "f2-fun-and-frustration-2019-2": "blurred, channel watermark",
    "f2-fun-and-frustration-2019-7": "repeats -6",
    "jaanu-2020-1": "blurred", "jaanu-2020-3": "blurred",
    "kotha-bangaru-lokam-2008-3": "half a face",
    "maharshi-2019-1": "half a face", "maharshi-2019-3": "repeats -2", "maharshi-2019-4": "dark", "maharshi-2019-5": "figure too small",
    "mr-perfect-2011-3": "lyric text", "mr-perfect-2011-4": "lyric text", "mr-perfect-2011-6": "blurred",
    "parugu-2008-4": "dark", "parugu-2008-5": "dark",
    "pilla-nuvvu-leni-jeevitham-2014-3": "dark, blurred",
    "sankranthiki-vasthunam-2025-4": "dark, empty",
    "seethamma-vakitlo-sirimalle-chettu-2013-2": "channel watermark", "seethamma-vakitlo-sirimalle-chettu-2013-3": "channel watermark",
    "seethamma-vakitlo-sirimalle-chettu-2013-4": "channel watermark across the face", "seethamma-vakitlo-sirimalle-chettu-2013-5": "channel watermark",
    "brindavanam-2010-1": "channel watermark",
    "shatamanam-bhavati-2017-1": "repeats -2", "shatamanam-bhavati-2017-4": "repeats -3", "shatamanam-bhavati-2017-6": "half a face",
    "supreme-2016-1": "half a face",
    "v-2020-1": "dark", "v-2020-2": "dark", "v-2020-4": "dark", "v-2020-5": "dark", "v-2020-7": "blurred",
}

# More of a film's own footage, where its one video gives too few clean stills.
EXTRA_VIDEOS = {
    "bommarillu-2006": ["Yip0FVe1vK0", "H-uC4HdBw8E"],  # the film
    "seethamma-vakitlo-sirimalle-chettu-2013": ["3lowhNvIWK0", "ZwGPx75hVLk", "jqAzbIZgUqE"],  # its songs
    "fidaa-2017": ["jjQhZaSdCpg"],  # the Vachinde song
}

# The strongest still of a film goes first (it is used first).
FIRST = {
    "fidaa-2017": ["fidaa-2017-2", "fidaa-2017-3"],
    "maharshi-2019": ["maharshi-2019-7", "maharshi-2019-6", "maharshi-2019-8"],
    "sankranthiki-vasthunam-2025": ["sankranthiki-vasthunam-2025-3", "sankranthiki-vasthunam-2025-1"],
    "shatamanam-bhavati-2017": ["shatamanam-bhavati-2017-3", "shatamanam-bhavati-2017-2"],
    "v-2020": ["v-2020-6"],
    "balagam-2023": ["balagam-2023-2", "balagam-2023-1"],
    "bommarillu-2006": ["bommarillu-2006-1", "bommarillu-2006-4"],
    "seethamma-vakitlo-sirimalle-chettu-2013": [
        "seethamma-vakitlo-sirimalle-chettu-2013-25",
        "seethamma-vakitlo-sirimalle-chettu-2013-20",
        "seethamma-vakitlo-sirimalle-chettu-2013-16",
    ],
    "brindavanam-2010": ["brindavanam-2010-3", "brindavanam-2010-2"],
}


def load(path, pattern):
    text = open(path, encoding="utf-8").read()
    return json.loads(re.search(pattern, text).group(1))


def video_ids(film):
    ids = []
    if film.get("trailer"):
        ids.append(film["trailer"])
    for v in film.get("videos") or []:
        if v.get("youtubeId"):
            ids.append(v["youtubeId"])
    m = re.search(r"__([A-Za-z0-9_-]{11})\.jpg$", film.get("image") or "")
    if m:
        ids.append(m.group(1))
    return list(dict.fromkeys(ids))


def fetch_frame(vid, n):
    """One of YouTube's in-video frames, largest size available (None if there is none)."""
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
    return None


def trim_bars(im):
    """Drop near-black rows and columns at the edges (letterbox and pillarbox)."""
    a = np.asarray(im.convert("L")).astype(float)
    rows = np.where(a.mean(axis=1) > 18)[0]
    cols = np.where(a.mean(axis=0) > 18)[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    return im.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))


front = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
profile = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")


def faces(im):
    gray = cv2.equalizeHist(cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY))
    h, w = gray.shape
    size = (max(24, h // 12), max(24, h // 12))
    found = []
    for cascade, flip in ((front, False), (profile, False), (profile, True)):
        g = cv2.flip(gray, 1) if flip else gray
        for (x, y, fw, fh) in cascade.detectMultiScale(g, scaleFactor=1.1, minNeighbors=7, minSize=size):
            if flip:
                x = w - x - fw
            found.append((x, y, fw, fh))
    return found


def crop_centres(im):
    """Horizontal centres for tall crops: one per group of faces that fits in a crop."""
    cw = im.height * 2 / 3
    fs = sorted(faces(im), key=lambda f: f[0] + f[2] / 2)
    if not fs:
        return [im.width / 2]
    groups, cur = [], [fs[0]]
    for f in fs[1:]:
        if (f[0] + f[2]) - cur[0][0] <= cw * 0.8:
            cur.append(f)
        else:
            groups.append(cur)
            cur = [f]
    groups.append(cur)
    centres = []
    for g in groups:
        wts = np.array([fw * fh for (_, _, fw, fh) in g], dtype=float)
        cx = float((np.array([x + fw / 2 for (x, _, fw, _) in g]) * wts).sum() / wts.sum())
        if all(abs(cx - c) > cw * 0.45 for c in centres):
            centres.append(cx)
    return centres


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", help="RealESRGAN_x4plus.pth (optional; without it crops are resized only)")
    args = ap.parse_args()
    upscale = None
    if args.weights:
        sys.path.insert(0, os.path.dirname(__file__))
        from build_posters import load_esrgan

        upscale = load_esrgan(args.weights)

    films = {f["slug"]: f for f in load("src/data/films.ts", r"=\s*(\[[\s\S]*\]);?\s*$")}
    awards = load("src/data/awards.ts", r"=\s*(\[[\s\S]*\]);?\s*$")
    slugs = list(dict.fromkeys(a["filmSlug"] for a in awards if a.get("filmSlug")))

    os.makedirs(OUT_DIR, exist_ok=True)
    stills = {}
    for slug in slugs:
        out = []
        k = 0
        for vid in video_ids(films[slug]) + EXTRA_VIDEOS.get(slug, []):
            for n in (1, 2, 3):
                im = fetch_frame(vid, n)
                im = trim_bars(im) if im else None
                if im is None or im.width < im.height * 1.2:
                    continue
                a = np.asarray(im.convert("L")).astype(float)
                if a.mean() < 30 or a.std() < 22:  # black, faded or flat frames
                    continue
                for cx in crop_centres(im):
                    k += 1
                    name = f"{slug}-{k}"
                    if name in SKIP:
                        continue
                    cw = round(im.height * 2 / 3)
                    left = int(min(max(cx - cw / 2, 0), im.width - cw))
                    crop = im.crop((left, 0, left + cw, im.height))
                    if upscale:
                        crop = upscale(crop)
                    crop = crop.resize((W_OUT, H_OUT), Image.LANCZOS)
                    crop.save(f"{OUT_DIR}/{name}.jpg", quality=84, optimize=True, progressive=True)
                    out.append({"src": f"/images/stills/{name}.jpg", "w": W_OUT, "h": H_OUT})
        first = FIRST.get(slug, [])
        out.sort(key=lambda o: first.index(o["src"].rsplit("/", 1)[1][:-4]) if o["src"].rsplit("/", 1)[1][:-4] in first else len(first))
        stills[slug] = out
        print(slug, len(out))

    with open("src/data/stills.ts", "w", encoding="utf-8") as f:
        f.write("// Generated by scripts/fetch_award_stills.py. Do not edit by hand.\n")
        f.write("// Tall 2:3 stills cut from each awarded film's YouTube frames, for the awards register.\n\n")
        f.write("export const filmStills: Record<string, { src: string; w: number; h: number }[]> = ")
        f.write(json.dumps(stills, indent=2))
        f.write(";\n")


if __name__ == "__main__":
    main()
