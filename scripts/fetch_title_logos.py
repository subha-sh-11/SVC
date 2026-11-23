"""Downloads official title logos (transparent PNGs) for SVC productions from TMDB.

Needs a TMDB API key: either the v3 "API Key" or the "API Read Access Token",
in .env.local (not committed) as TMDB_API_KEY=... or TMDB_READ_TOKEN=...
(or in the environment). Logos go to assets/title_logos/<slug>.png with provenance in
scripts/title_logos.json; then run scripts/build_posters.py so the opening
flicker uses them. Preference: the original Telugu logo, then English, then a
logo without language (then Tamil/Hindi). Films TMDB has no logo for keep their plain title.

This product uses the TMDB API but is not endorsed or certified by TMDB.
Usage: python scripts/fetch_title_logos.py
"""
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.themoviedb.org/3"
IMG = "https://image.tmdb.org/t/p/original"
OUT_DIR = "assets/title_logos"  # sources (not served); build_posters.py makes the web copies
META = "scripts/title_logos.json"
LANG = {"Telugu": "te", "Tamil": "ta", "Hindi": "hi"}


def credentials():
    env = dict(os.environ)
    if os.path.exists(".env.local"):
        for line in open(".env.local", encoding="utf-8"):
            m = re.match(r"\s*([A-Z_]+)\s*=\s*(.+?)\s*$", line)
            if m:
                env.setdefault(m.group(1), m.group(2).strip("'\""))
    return env.get("TMDB_API_KEY"), env.get("TMDB_READ_TOKEN")


KEY, TOKEN = credentials()


def get(path, **params):
    if KEY and not TOKEN:
        params["api_key"] = KEY
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    headers = {"Accept": "application/json"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
                time.sleep(0.12)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(float(e.headers.get("Retry-After") or 2))
                continue
            raise


def core_films():
    text = open("src/data/films.ts", encoding="utf-8").read()
    films = json.loads(re.search(r"=\s*(\[[\s\S]*\]);?\s*$", text).group(1))
    return [f for f in films if f["category"] == "core"]


def original_language(film):
    return LANG.get(film.get("languageKey") or "", "te")


def find_movie(film):
    """TMDB match: same year (±1) AND the film's original language (so "V" can't match a Czech film)."""
    lang = original_language(film)
    names = [film["title"], *[re.sub(r"\s*\(\d{4}\)$", "", n) for n in film.get("altNames", [])]]
    for name in dict.fromkeys(names):
        for year_param in ({"primary_release_year": film["year"]}, {}):
            res = get("/search/movie", query=name, include_adult="false", **year_param).get("results", [])
            res = [
                r for r in res
                if abs(int((r.get("release_date") or "0")[:4] or 0) - film["year"]) <= 1 and r.get("original_language") == lang
            ]
            if res:
                return max(res, key=lambda r: r.get("popularity", 0))
    return None


def pick_logo(logos, lang):
    """The film's original-language logo first ("original name font"), then English, then any."""
    for lang in dict.fromkeys([lang, "en", None, "te", "ta", "hi"]):
        cands = [l for l in logos if l.get("iso_639_1") == lang]
        if cands:
            return max(cands, key=lambda l: (l.get("vote_average", 0), l.get("width", 0)))
    return None


def main():
    if not (KEY or TOKEN):
        raise SystemExit("Add TMDB_API_KEY=... or TMDB_READ_TOKEN=... to .env.local first.")
    os.makedirs(OUT_DIR, exist_ok=True)
    meta, missing = {}, []
    for film in core_films():
        slug = film["slug"]
        movie = find_movie(film)
        if not movie:
            missing.append((slug, "no TMDB match"))
            continue
        logos = get(f"/movie/{movie['id']}/images", include_image_language="te,ta,hi,en,null").get("logos", [])
        logo = pick_logo(logos, original_language(film))
        if not logo:
            missing.append((slug, f"TMDB {movie['id']} has no logo"))
            continue
        ext = os.path.splitext(logo["file_path"])[1] or ".png"
        dest = os.path.join(OUT_DIR, slug + ext)
        with urllib.request.urlopen(IMG + logo["file_path"], timeout=60) as r, open(dest, "wb") as f:
            f.write(r.read())
        meta[slug] = {"tmdbId": movie["id"], "tmdbTitle": movie.get("original_title"), "language": logo.get("iso_639_1"), "width": logo.get("width"), "height": logo.get("height"), "file": dest.replace(os.sep, "/")}
        print(f"ok {slug:42s} {logo.get('iso_639_1') or '--'} {logo.get('width')}x{logo.get('height')}")
    with open(META, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"\nlogos: {len(meta)} of {len(core_films())}")
    for slug, why in missing:
        print("  missing:", slug, "-", why)


if __name__ == "__main__":
    main()
