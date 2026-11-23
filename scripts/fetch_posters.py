"""Downloads the official theatrical poster for every SVC production.

Source: the infobox poster of each film's English Wikipedia article (the article
URL is already recorded in the film's `sources`). Writes the images to
assets/posters_raw/<slug>.<ext> and their provenance to scripts/posters.json.

These posters are copyrighted artwork used on Wikipedia under fair use. Before
the website is published, SVC must confirm it may use them (or supply its own).

Usage: python scripts/fetch_posters.py [--all]
  --all  every catalogue title (presentations and related titles too), not only SVC productions
"""
import argparse
import json
import os
import re
import time
import urllib.parse
import urllib.error
import urllib.request

API = "https://en.wikipedia.org/w/api.php"
UA = "SVC-website-build/1.0 (non-commercial build script)"
OUT_DIR = "assets/posters_raw"  # source downloads (not served)
META = "scripts/posters.json"
PACE = 1.5  # seconds between requests


def fetch(url, attempts=6):
    """GET with polite pacing and backoff on 429 / 5xx (honours Retry-After)."""
    delay = 4.0
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read()
            time.sleep(PACE)
            return body
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or i == attempts - 1:
                raise
            wait = float(e.headers.get("Retry-After") or delay)
            time.sleep(min(wait, 60))
            delay *= 2


def api(params):
    params = {**params, "format": "json", "formatversion": "2"}
    return json.loads(fetch(API + "?" + urllib.parse.urlencode(params)))


def catalogue(everything=False):
    text = open("src/data/films.ts", encoding="utf-8").read()
    films = json.loads(re.search(r"=\s*(\[[\s\S]*\]);?\s*$", text).group(1))
    return films if everything else [f for f in films if f["category"] == "core"]


def article_title(film):
    for s in film.get("sources", []):
        url = s if isinstance(s, str) else s.get("url", "")
        m = re.match(r"https?://en\.wikipedia\.org/wiki/(.+)", url)
        if m and "Sri_Venkateswara_Creations" not in m.group(1):
            return urllib.parse.unquote(m.group(1)).replace("_", " ")
    return None


def infobox_image(title):
    data = api({"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main", "rvsection": "0", "titles": title, "redirects": "1"})
    page = data["query"]["pages"][0]
    if "revisions" not in page:
        return None, page.get("title")
    wikitext = page["revisions"][0]["slots"]["main"]["content"]
    m = re.search(r"^\s*\|\s*image\s*=\s*(.+?)\s*$", wikitext, re.MULTILINE)
    if not m:
        return None, page["title"]
    value = m.group(1)
    value = re.sub(r"^\[\[(?:File|Image):", "", value)
    value = value.split("|")[0].replace("]]", "").strip()
    value = re.sub(r"^(?:File|Image):", "", value).strip()
    return (value or None), page["title"]


def image_info(filename):
    data = api({"action": "query", "titles": "File:" + filename, "prop": "imageinfo", "iiprop": "url|size|extmetadata"})
    page = data["query"]["pages"][0]
    if "imageinfo" not in page:
        return None
    ii = page["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    return {
        "url": ii["url"],
        "width": ii["width"],
        "height": ii["height"],
        "filePage": ii.get("descriptionurl"),
        "license": meta.get("LicenseShortName", {}).get("value", ""),
        "nonFree": meta.get("NonFree", {}).get("value", "") == "true",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="every catalogue title, not only SVC productions")
    films = catalogue(ap.parse_args().all)
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = json.load(open(META, encoding="utf-8")) if os.path.exists(META) else {}
    for film in films:
        slug = film["slug"]
        if slug in meta and os.path.exists(meta[slug]["raw"]):
            continue  # already downloaded (resumable)
        title = article_title(film)
        if not title:
            print("no article:", slug)
            continue
        try:
            filename, resolved = infobox_image(title)
            if not filename:
                print("no infobox image:", slug, "|", resolved)
                continue
            info = image_info(filename)
            if not info:
                print("no image info:", slug, filename)
                continue
            ext = os.path.splitext(urllib.parse.urlparse(info["url"]).path)[1].lower() or ".jpg"
            dest = os.path.join(OUT_DIR, slug + ext)
            with open(dest, "wb") as f:
                f.write(fetch(info["url"]))
            meta[slug] = {"title": film["title"], "year": film["year"], "article": resolved, "file": filename, "raw": dest.replace(os.sep, "/"), **info}
            print(f"ok {slug:42s} {info['width']}x{info['height']} {info['license']}")
        except Exception as e:  # keep going; report at the end
            print("error:", slug, repr(e))
        with open(META, "w", encoding="utf-8") as f:  # save progress after each film
            json.dump(meta, f, indent=2, ensure_ascii=False)
    with open(META, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"\nposters: {sum(f['slug'] in meta for f in films)} of {len(films)}")


if __name__ == "__main__":
    main()
