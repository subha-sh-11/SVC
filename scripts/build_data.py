"""Regenerate src/data/*.ts from the research spreadsheet.

Usage (from the SVC folder):
    python scripts/build_data.py [path/to/SVC_Content_Catalogue.xlsx]

Defaults to ../SVC_Content_Catalogue.xlsx. Requires: pip install openpyxl
"""
import datetime, json, os, re, sys

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "SVC_Content_Catalogue.xlsx")
OUT = os.path.join(HERE, "..", "src", "data")
os.makedirs(OUT, exist_ok=True)

_wb = openpyxl.load_workbook(XLSX, read_only=True)


def load(name):
    """Read a sheet into a list of dicts, using the first row with 4+ filled cells as the header."""
    rows = list(_wb[name].iter_rows(values_only=True))
    hi = next(i for i, r in enumerate(rows) if sum(1 for c in r if c is not None) >= 4)
    hdr = [(h or "").strip() for h in rows[hi]]
    out = []
    for r in rows[hi + 1 :]:
        if not any(c is not None for c in r):
            continue
        rec = {}
        for j, c in enumerate(r):
            if hdr[j]:
                rec[hdr[j]] = c.strftime("%Y-%m-%d") if isinstance(c, datetime.datetime) else c
        out.append(rec)
    return out


def clean(v):
    if v is None:
        return None
    if isinstance(v, str):
        v = v.replace("\xa0", " ").strip()
        v = re.sub(r"[ \t]+", " ", v)
        return v or None
    return v


def split(v, sep=";"):
    v = clean(v)
    if not v:
        return []
    return [p.strip() for p in v.split(sep) if p.strip()]


def urls(*vals):
    out = []
    for v in vals:
        v = clean(v)
        if not v:
            continue
        for u in re.findall(r"https?://\S+", v):
            if u not in out:
                out.append(u)
    return out


def yt_id(u):
    if not u:
        return None
    m = re.search(r"(?:v=|youtu\.be/|/shorts/)([A-Za-z0-9_-]{11})", u)
    return m.group(1) if m else None


def videos(v):
    out = []
    for line in (clean(v) or "").split("\n"):
        line = line.strip()
        m = re.match(r"(.*?):\s*(https?://\S+)", line)
        if m and yt_id(m.group(2)):
            out.append({"label": m.group(1).strip(), "youtubeId": yt_id(m.group(2))})
    return out


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def img(p):
    p = clean(p)
    return "/" + p if p else None


KNOWN_CREDITS = sorted([
    "Sri Venkateswara Creations", "Bayview Projects", "First Frame Entertainments", "Sai Akhilesh Productions",
    "Harshith Reddy", "Boney Kapoor", "Dil Raju", "Shirish", "Sirish", "Laxman", "Lakshman", "Raju", "Giri",
], key=len, reverse=True)


def separate_credits(v):
    """'Dil Raju Shirish' -> 'Dil Raju; Shirish' when the string is only known names run together."""
    v = clean(v)
    if v and v.startswith("See banner"):
        return None
    if not v or ";" in v or "," in v or "/" in v:
        return v
    rest, parts = v, []
    while rest:
        hit = next((k for k in KNOWN_CREDITS if rest.startswith(k) and (len(rest) == len(k) or rest[len(k)] == " ")), None)
        if not hit:
            return v
        parts.append(hit)
        rest = rest[len(hit):].lstrip()
    return "; ".join(parts)


def clean_recipient(v):
    v = clean(v)
    if not v:
        return v
    return re.sub(r"\s*\((?:film-level award|named certificate)[^)]*\)", "", v).strip()


assets_raw = load("Assets")
asset_path = {a["Asset ID"]: img(a["Portable image path"]) for a in assets_raw}

# ---------------------------------------------------------------- films
ROLE = {
    "SVC production": ("core", "SVC Production"),
    "SVC collaboration or co-banner production": ("core", "Co-production"),
    "Dil Raju Productions or affiliated co-production": ("related", "Dil Raju Productions"),
    "SVC or Dil Raju presentation": ("presentation", "Presentation"),
    "Telugu dubbed-version release/acquisition": ("presentation", "Telugu Version Release"),
    "Telugu dubbed-version distribution": ("presentation", "Telugu Version Release"),
    "Telugu dubbed-version release/distribution": ("presentation", "Telugu Version Release"),
    "SVC Telugu version production and presentation": ("presentation", "Telugu Version"),
    "SVC presentation of Matinee Entertainments production": ("presentation", "Presentation"),
    "Acquired Telugu-states distribution": ("presentation", "Distribution"),
    "Acquired and released by Dil Raju; SVC association": ("presentation", "Acquisition"),
    "SVC and Lucky Media banners; Dil Raju presents": ("presentation", "Co-banner Presentation"),
    "SVC presentation and collaboration with Gunaa Teamworks": ("presentation", "Presentation"),
}

films = []
for f in load("Films"):
    role = clean(f["SVC or related banner role"])
    cat, label = ROLE[role]
    lang = clean(f["Language or version"])
    lang_key = "Telugu"
    if lang.startswith("Hindi"):
        lang_key = "Hindi"
    elif lang.startswith("Tamil"):
        lang_key = "Tamil"
    rel = [asset_path[x.strip()] for x in split(f["Related asset IDs"]) if asset_path.get(x.strip())]
    image = img(f["Primary image path"])
    gallery = [p for p in rel if p and p != image]
    trailer = yt_id(clean(f["Official original trailer"]))
    vids = videos(f["Labelled official videos"])
    if trailer and not any(v["youtubeId"] == trailer for v in vids):
        vids.insert(0, {"label": "Trailer", "youtubeId": trailer})
    rd = clean(f["Release date"])
    films.append({
        "slug": f["Film ID"],
        "title": clean(f["Title"]),
        "year": int(f["Year"]),
        "category": cat,
        "roleLabel": label,
        "role": role,
        "director": clean(f["Director"]),
        "cast": split(f["Principal cast"]),
        "premise": clean(f["Original short premise"]),
        "language": lang,
        "languageKey": lang_key,
        "genre": clean(f["Genre"]),
        "releaseDate": rd,
        "datePrecision": clean(f["Date precision"]),
        "altNames": split(f["Alternate names"]),
        "producers": separate_credits(f["Credited producers"]),
        "banners": separate_credits(f["Credited banners"]),
        "music": clean(f["Music"]),
        "image": image,
        "gallery": gallery,
        "trailer": trailer,
        "videos": vids,
        "isSeries": "series" in (clean(f["Genre"]) or "").lower(),
        "sources": urls(f["Source 1"], f["Source 2"], f["Further sources"]),
    })

films.sort(key=lambda x: (x["year"], x["releaseDate"] or ""))
by_norm = {norm(f["title"]): f["slug"] for f in films}
by_norm.update({norm(a): f["slug"] for f in films for a in f["altNames"]})
ALIAS = {"sankranthikivasthunnam": "sankranthiki-vasthunam-2025", "f2funandfrustration": "f2-fun-and-frustration-2019", "mcamiddleclassabbayi": "mca-middle-class-abbayi-2017"}

# ---------------------------------------------------------------- awards
def body_group(b):
    b = b or ""
    if b.startswith("National Film Awards"):
        return "National Film Awards"
    if b.startswith("Andhra Pradesh Nandi"):
        return "Nandi Awards"
    if b.startswith("Filmfare"):
        return "Filmfare Awards South"
    if b.startswith("South Indian International"):
        return "SIIMA"
    if b.startswith("Telangana Gaddar"):
        return "Gaddar Film Awards"
    if "Indian Panorama" in b or b.startswith("International Film Festival of India"):
        return "IFFI Indian Panorama"
    return "Other Honours"


awards = []
for a in load("Awards"):
    film = clean(a["Film or person"])
    slug = ALIAS.get(norm(film)) or by_norm.get(norm(film))
    awards.append({
        "id": a["Award ID"],
        "film": film,
        "filmSlug": slug,
        "filmYear": a["Film year"],
        "body": clean(a["Award body"]),
        "group": body_group(clean(a["Award body"])),
        "category": clean(a["Category"]),
        "recipient": clean_recipient(a["Actual recipient"]),
        "outcome": clean(a["Outcome"]),
        "awardYear": a["Award year"],
        "eventYear": a["Event year"] if isinstance(a["Event year"], int) else None,
        "edition": clean(a["Edition"]),
        "bannerScope": clean(a["Banner scope"]),
        "companyRole": clean(a["Company role"]),
        "scope": clean(a["Award scope"]),
        "evidence": clean(a["Evidence status"]),
        "sources": urls(a["Source 1"], a["Source 2"], a["Further sources"]),
    })

# ---------------------------------------------------------------- upcoming
upcoming = []
for p in load("Announced"):
    vids = videos(p["Labelled official videos"])
    upcoming.append({
        "slug": p["Project ID"] or re.sub(r"[^a-z0-9]+", "-", clean(p["Title or working title"]).lower()).strip("-"),
        "title": clean(p["Title or working title"]),
        "director": clean(p["Director"]),
        "cast": split(p["Announced cast"]),
        "banner": clean(p["Banner"]),
        "role": clean(p["Role"]),
        "release": clean(p["Announced release"]),
        "status": clean(p["Status"]),
        "altNames": split(p["Alternate names"]),
        "image": img(p["Primary image path"]),
        "videos": vids,
        "sources": urls(p["Source 1"], p["Source 2"], p["Further sources"]),
    })

# ---------------------------------------------------------------- timeline
TL_IMG = {
    "Dil begins the production journey": "/images/dil_sunnxt_landscape.jpg",
    "Arya introduces Sukumar": "/images/arya__HkmX7CGbYEU.jpg",
    "Bhadra introduces Boyapati Srinu": "/images/bhadra_prime_video_artwork.jpg",
    "Bommarillu": "/images/bommarillu__8A5I76C_638.jpg",
    "More directorial debuts": "/images/munna__h1fOJVrBapg.jpg",
    "Seethamma Vakitlo Sirimalle Chettu": "/images/seethamma_vakitlo_sirimalle_chettu__8-fsOSq-_Mw.jpg",
    "A busy year of six core releases": "/images/fidaa__AVtvjfoXNXc.jpg",
    "National recognition for Shatamanam Bhavati": "/images/shatamanam_national_award_2017_godl.jpg",
    "F2 and Maharshi": "/images/f2__XttQbFKkeHQ.jpg",
    "V premieres digitally": "/images/v__eBcYKDUT8fs.jpg",
    "National recognition for Maharshi": "/images/maharshi__ByjXIbg4hjw.jpg",
    "Varisu and two decades of production": "/images/varisu__9fux9swQ5AQ.jpg",
    "Balagam under Dil Raju Productions": "/images/balagam__8R3Vcy5CaPc.jpg",
    "Game Changer and SVC50": "/images/game_changer__zHiKFSBO_JE.jpg",
    "Sankranthiki Vasthunam": "/images/sankranthiki_vasthunam__yCkl2Z3PBs0.jpg",
    "Dil Raju Dreams platform launch": "/images/dreams_gallery_01.jpg",
    "Markandeya announced through DilRaju Dreams": "/images/dreams_gallery_05.jpg",
    "New Telugu and Hindi announcements": "/images/rowdy_janardhana__Q1s_CWfGAHk.jpg",
}
TL_FILM = {
    "Dil begins the production journey": "dil-2003",
    "Arya introduces Sukumar": "arya-2004",
    "Bhadra introduces Boyapati Srinu": "bhadra-2005",
    "Bommarillu": "bommarillu-2006",
    "Seethamma Vakitlo Sirimalle Chettu": "seethamma-vakitlo-sirimalle-chettu-2013",
    "National recognition for Shatamanam Bhavati": "shatamanam-bhavati-2017",
    "F2 and Maharshi": "f2-fun-and-frustration-2019",
    "V premieres digitally": "v-2020",
    "National recognition for Maharshi": "maharshi-2019",
    "Varisu and two decades of production": "varisu-2023",
    "Balagam under Dil Raju Productions": "balagam-2023",
    "Game Changer and SVC50": "game-changer-2025",
    "Sankranthiki Vasthunam": "sankranthiki-vasthunam-2025",
}
timeline = []
for t in load("Timeline"):
    m = clean(t["Milestone"])
    timeline.append({
        "date": clean(str(t["Date or period"])),
        "title": m,
        "type": clean(t["Type"]),
        "description": clean(t["Website description"]),
        "image": TL_IMG.get(m),
        "filmSlug": TL_FILM.get(m),
    })

# ---------------------------------------------------------------- distribution
distribution = []
for d in load("Distribution"):
    film = clean(d["Film"])
    distribution.append({
        "film": film,
        "year": d["Year"],
        "territory": clean(d["Territory or version"]),
        "status": clean(d["Release or rights status"]),
        "role": clean(d["Role"]),
        "filmSlug": by_norm.get(norm(film)),
    })

# ---------------------------------------------------------------- assets
assets = []
for a in assets_raw:
    assets.append({
        "id": a["Asset ID"],
        "film": clean(a["Associated film"]),
        "title": clean(a["Image title"]),
        "type": clean(a["Asset type"]),
        "src": img(a["Portable image path"]),
        "width": a["Width px"],
        "height": a["Height px"],
        "rights": clean(a["Rights status"]),
        "sourcePage": clean(a["Source page"]),
        "bannerScope": clean(a["Banner scope"]),
    })


def emit(name, typ, data, comment):
    path = os.path.join(OUT, name + ".ts")
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(f"// {comment}\n// Generated from SVC_Content_Catalogue.xlsx (research checked 12 November 2026).\n")
        fh.write(f'import type {{ {typ} }} from "./types";\n\n')
        fh.write(f"export const {name}: {typ}[] = ")
        fh.write(json.dumps(data, ensure_ascii=False, indent=2))
        fh.write(";\n")
    print(name, len(data))


emit("films", "Film", films, "Released film and screen catalogue: core SVC, presentations/versions and related banners.")
emit("awards", "Award", awards, "Awards and festival recognition register.")
emit("upcoming", "UpcomingProject", upcoming, "Announced and unresolved projects.")
emit("timeline", "Milestone", timeline, "Company milestone timeline.")
emit("distribution", "DistributionRecord", distribution, "Distribution research index (not production credits).")
emit("assets", "Asset", assets, "Image archive manifest.")
print("unmatched awards:", [a["film"] for a in awards if not a["filmSlug"]])
