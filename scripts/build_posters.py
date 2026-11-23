"""Builds web-ready posters and src/data/posters.ts for the opening sequence.

For each SVC production (in release order):
  - official poster from scripts/posters.json (see fetch_posters.py), upscaled 4x
    with Real-ESRGAN when weights are given (Wikipedia keeps posters small), then
    public/posters/lg/<slug>.webp (900px tall, the flicker) and
    public/posters/sm/<slug>.webp (360px wide, the wall);
  - films without a poster fall back to their existing artwork, cropped on faces.
Official title logos in assets/title_logos/<slug>.(png|webp|svg) (see fetch_title_logos.py)
are optimised into public/posters/titles/ and shown in the opening flicker.

Usage: python scripts/build_posters.py [--weights RealESRGAN_x4plus.pth]
"""
import argparse
import json
import os
import re

from PIL import Image

LG_H, SM_W = 900, 360

# Wikipedia posters not to use, with the reason (the film's own artwork is used instead).
SKIP = {
    "gaganam-2011": "the infobox poster is the Tamil version, titled Payanam",
    "aakasamantha-2009": "the infobox poster is the Tamil original, Abhiyum Naanum",
    "snehithudu-2012": "the infobox poster is the Tamil original, Nanban",
    "police-2016": "the infobox poster is the Tamil original, Theri",
    "maro-charitra-2010": "the infobox image is square artwork, not a portrait poster",
    "jawaan-2017": "the infobox image is a landscape banner, not a portrait poster",
    "shaakuntalam-2023": "the infobox image is a landscape banner, not a portrait poster",
}


def all_films():
    text = open("src/data/films.ts", encoding="utf-8").read()
    return json.loads(re.search(r"=\s*(\[[\s\S]*\]);?\s*$", text).group(1))


def core_films():
    return [f for f in all_films() if f["category"] == "core"]


def focal():
    text = open("src/data/focal.ts", encoding="utf-8").read()
    return json.loads(text[text.index("= {") + 2 : text.rstrip().rstrip(";").rindex("}") + 1])


def load_esrgan(weights):
    import numpy as np
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    class RDB(nn.Module):
        def __init__(s, nf=64, gc=32):
            super().__init__()
            s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
            s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1); s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
            s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.lrelu = nn.LeakyReLU(0.2, True)

        def forward(s, x):
            x1 = s.lrelu(s.conv1(x)); x2 = s.lrelu(s.conv2(torch.cat((x, x1), 1)))
            x3 = s.lrelu(s.conv3(torch.cat((x, x1, x2), 1))); x4 = s.lrelu(s.conv4(torch.cat((x, x1, x2, x3), 1)))
            return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x

    class RRDB(nn.Module):
        def __init__(s, nf):
            super().__init__(); s.rdb1 = RDB(nf); s.rdb2 = RDB(nf); s.rdb3 = RDB(nf)

        def forward(s, x):
            return s.rdb3(s.rdb2(s.rdb1(x))) * 0.2 + x

    class RRDBNet(nn.Module):
        def __init__(s, nb=23, nf=64):
            super().__init__()
            s.conv_first = nn.Conv2d(3, nf, 3, 1, 1); s.body = nn.Sequential(*[RRDB(nf) for _ in range(nb)])
            s.conv_body = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
            s.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
            s.conv_last = nn.Conv2d(nf, 3, 3, 1, 1); s.lrelu = nn.LeakyReLU(0.2, True)

        def forward(s, x):
            f = s.conv_first(x); f = f + s.conv_body(s.body(f))
            f = s.lrelu(s.conv_up1(F.interpolate(f, scale_factor=2, mode="nearest")))
            f = s.lrelu(s.conv_up2(F.interpolate(f, scale_factor=2, mode="nearest")))
            return s.conv_last(s.lrelu(s.conv_hr(f)))

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = RRDBNet()
    sd = torch.load(weights, map_location="cpu", weights_only=True)
    model.load_state_dict(sd.get("params_ema", sd.get("params", sd)), strict=True)
    model = model.eval().to(device)
    if device == "cuda":
        model = model.half()

    @torch.no_grad()
    def upscale(img):
        a = np.asarray(img.convert("RGB")).astype(np.float32) / 255.0
        pad = 8
        a = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode="edge")
        t = torch.from_numpy(a).permute(2, 0, 1)[None].to(device)
        t = t.half() if device == "cuda" else t
        o = model(t).clamp(0, 1)[0].permute(1, 2, 0).float().cpu().numpy()
        o = o[pad * 4 : -pad * 4, pad * 4 : -pad * 4]
        return Image.fromarray((o * 255).round().astype("uint8"))

    return upscale


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", help="RealESRGAN_x4plus.pth (optional; without it posters are resized only)")
    ap.add_argument("--force", action="store_true", help="rebuild posters that already exist in public/posters")
    args = ap.parse_args()
    upscale = load_esrgan(args.weights) if args.weights else None

    meta = json.load(open("scripts/posters.json", encoding="utf-8")) if os.path.exists("scripts/posters.json") else {}
    foc = focal()
    os.makedirs("public/posters/lg", exist_ok=True)
    os.makedirs("public/posters/sm", exist_ok=True)

    # Every catalogue title with an official poster (fetch_posters.py --all), built once.
    posters = {}
    for f in sorted(all_films(), key=lambda f: f["year"]):
        slug = f["slug"]
        m = meta.get(slug)
        if not (m and os.path.exists(m["raw"]) and slug not in SKIP):
            continue
        lg_path, sm_path = f"public/posters/lg/{slug}.webp", f"public/posters/sm/{slug}.webp"
        if args.force or not (os.path.exists(lg_path) and os.path.exists(sm_path)):
            img = Image.open(m["raw"]).convert("RGB")
            if upscale and img.height < LG_H:
                img = upscale(img)
            lg = img.resize((round(img.width * LG_H / img.height), LG_H), Image.LANCZOS)
            lg.save(lg_path, quality=80, method=6)
            sm = img.resize((SM_W, round(img.height * SM_W / img.width)), Image.LANCZOS)
            sm.save(sm_path, quality=74, method=6)
            print("built", slug)
        w, h = Image.open(lg_path).size
        posters[slug] = {"lg": f"/posters/lg/{slug}.webp", "sm": f"/posters/sm/{slug}.webp", "w": w, "h": h, "source": m.get("filePage", "")}

    films = sorted(core_films(), key=lambda f: f["year"])  # stable: keeps catalogue order within a year
    tiles, missing = [], []
    for f in films:
        slug = f["slug"]
        if slug in posters:
            p = posters[slug]
            tiles.append({"slug": slug, "title": f["title"], "year": f["year"], "lg": p["lg"], "sm": p["sm"], "position": "50% 50%", "official": True, "source": p["source"]})
        else:
            fx = foc.get(f["image"], {}).get("x", 0.5)
            visible = (2 / 3) / (16 / 9)  # a 2:3 tile cut from 16:9 artwork
            px = min(max((fx - visible / 2) / (1 - visible), 0), 1)
            tiles.append({"slug": slug, "title": f["title"], "year": f["year"], "lg": f["image"], "sm": f["image"], "position": f"{round(px * 100)}% 50%", "official": False, "source": ""})
            missing.append(slug)

    # Official title logos: sources in assets/title_logos/<slug>.(png|webp|svg) (fetch_title_logos.py,
    # or files SVC supplies); web copies fit within 1400x700 as WebP with transparency.
    logos = {}
    if os.path.isdir("assets/title_logos"):
        os.makedirs("public/posters/titles", exist_ok=True)
        for name in sorted(os.listdir("assets/title_logos")):
            stem, ext = os.path.splitext(name)
            ext = ext.lower()
            if ext == ".svg":
                import shutil
                shutil.copy(os.path.join("assets/title_logos", name), f"public/posters/titles/{name}")
                logos[stem] = f"/posters/titles/{name}"
            elif ext in (".png", ".webp"):
                im = Image.open(os.path.join("assets/title_logos", name)).convert("RGBA")
                bbox = im.getbbox()
                if bbox:
                    im = im.crop(bbox)  # trim empty margins so every logo fills its frame
                im.thumbnail((1400, 700), Image.LANCZOS)
                im.save(f"public/posters/titles/{stem}.webp", quality=88, method=6)
                logos[stem] = f"/posters/titles/{stem}.webp"

    with open("src/data/posters.ts", "w", encoding="utf-8") as out:
        out.write("// Generated by scripts/build_posters.py. Do not edit by hand.\n")
        out.write("// Official posters (Wikipedia infobox artwork, fair use; SVC approval required before launch).\n\n")
        out.write("export interface PosterTile {\n  slug: string;\n  title: string;\n  year: number;\n  /** ~900px tall: the opening flicker */\n  lg: string;\n  /** ~360px wide: the poster wall */\n  sm: string;\n  /** object-position for a 2:3 crop */\n  position: string;\n  /** false when no official poster was found and film artwork is used instead */\n  official: boolean;\n  source: string;\n}\n\n")
        out.write("/** Every SVC production, in release order. */\n")
        out.write("export const posterWall: PosterTile[] = " + json.dumps(tiles, indent=2, ensure_ascii=False) + ";\n\n")
        out.write("/** Official title-logo artwork (public/titles/<slug>.png|webp|svg), shown in the flicker when present. */\n")
        out.write("export const titleLogos: Record<string, string> = " + json.dumps(logos, indent=2) + ";\n\n")
        out.write("/** The official poster of every catalogue title that has one (lg: 900px tall, sm: 360px wide). */\n")
        out.write("export const filmPosters: Record<string, { lg: string; sm: string; w: number; h: number; source: string }> = " + json.dumps(posters, indent=2, ensure_ascii=False) + ";\n")
    print(f"tiles {len(tiles)}  official posters {len(tiles) - len(missing)}  fallbacks {missing}  title logos {len(logos)}  catalogue posters {len(posters)}")


if __name__ == "__main__":
    main()
