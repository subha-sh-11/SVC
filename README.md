# Sri Venkateswara Creations — website

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, with Motion for animation and Lenis for smooth scrolling.

## Run it

Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3210
npm run build && npm start
```

## Deploy

The site builds to 84 static pages plus one server route (`/api/enquiry`), so any Next.js host works. Vercel needs no configuration:

1. Push this folder to a Git repository, or run `npx vercel` from this folder. If the repository holds the whole `SVC CINEMAS` workspace, set the project's **Root Directory** to `SVC`.
2. Set `NEXT_PUBLIC_SITE_URL` to the live domain, e.g. `https://www.your-domain.com` (see `.env.example`). Without it, Vercel's own production domain is used.
3. Add the custom domain in the host's dashboard.

Other hosts (Netlify, Render, Railway, a VPS): build with `npm run build` and serve with `npm start`, which listens on `$PORT` (default 3000).

What the build gives a live site:

- `/sitemap.xml` (all pages and 70 film pages) and `/robots.txt`, using the site URL above.
- Security headers on every page, and a one-week browser cache for `/video`, `/posters`, `/images` and `/brand`.
- `/journey` redirects to `/production`.

Not deployed: `assets/` (raw downloads for the scripts), `scripts/` and `.env.local` (the TMDB key, used only by the scripts). They are listed in `.gitignore` and `.vercelignore`.

`public/video` is about 480 MB (the home reel has 720p, 1080p and 4K versions, picked by screen size), so choose a plan with enough bandwidth. Vercel's free Hobby plan is for non-commercial use only; a company site needs Pro.

## Pages

| Route | Content |
| --- | --- |
| `/` | Film hero slider, banner intro, signature-film reel, recent releases, National Awards, filmmaker debuts, journey and upcoming teasers |
| `/films` | All 70 catalogue titles, filterable by credit role, language and years, with search, sort and grid/index views |
| `/films/[slug]` | One statically generated page per film: premise, credits, trailers, awards, sources, previous/next film |
| `/production` | Poster-collage intro, then a pinned horizontal timeline of SVC's films since 2003; each card opens the full story |
| `/distribution` | The same for distribution since 1997, then a filterable poster wall of every release |
| `/awards` | National Awards highlight, tally by award body, filterable register of 86 records |
| `/upcoming` | Announced SVC slate, related-banner announcements, unconfirmed historical announcements |
| `/about` | Company story, producers, banner family |
| `/contact` | Enquiry form (`POST /api/enquiry`) and social links |

## Content

- `src/data/films.ts`, `awards.ts`, `upcoming.ts`, `timeline.ts`, `distribution.ts`, `assets.ts` are **generated** from `SVC_Content_Catalogue.xlsx`. Do not hand-edit them; update the spreadsheet and run:

  ```bash
  pip install openpyxl
  python scripts/build_data.py            # defaults to ../SVC_Content_Catalogue.xlsx
  ```

- `src/data/site.ts` holds hand-written copy (from the research PDF's "Original website copy"), people, banners, socials and the home-page film picks.
- Images live in `public/images/` with their original catalogue filenames. `public/brand/svc-emblem.png` is cut from a transparent source image and is a stand-in until SVC supplies its vector logo.

### Opening sequence (posters and title logos)

The home page opens with a title flicker, a poster wall and posters seen through "SVC" (in Playfair Display), then the SVC lockup. Its data is generated:

```bash
python scripts/fetch_posters.py      # official posters from each film's Wikipedia infobox -> assets/posters_raw/, scripts/posters.json
python scripts/build_posters.py --weights RealESRGAN_x4plus.pth   # -> public/posters/{lg,sm}/ and src/data/posters.ts
python scripts/make_svc_letters.py PlayfairDisplay[wght].ttf      # -> public/brand/svc-letters.svg (the letters mask)
```

- `--weights` is optional (Real-ESRGAN x4plus, from github.com/xinntao/Real-ESRGAN releases); without it posters are only resized, and look soft in the flicker.
- **Official title logos** (the opening flicker shows only these): `python scripts/fetch_title_logos.py` downloads them from TMDB into `assets/title_logos/` using `TMDB_API_KEY` from `.env.local` (git-ignored), matching each film by year and original language; then re-run `build_posters.py`, which makes the web copies in `public/posters/titles/`. TMDB had logos for 34 of 47 films. For the rest, add SVC-supplied files as `assets/title_logos/<slug>.png` (or `.svg`) and rebuild.
- `SKIP` in `build_posters.py` lists Wikipedia posters not to use (Gaganam's is the Tamil *Payanam* version).

## Before launch

- **Enquiry form:** `src/app/api/enquiry/route.ts` validates and logs submissions but does not deliver them anywhere yet. Connect it to SVC's business inbox or CRM.
- **Approvals:** the research marks most artwork as needing SVC approval for publication, and several facts (Dil's exact release day, legal entity, current titles, some award certificates) as needing confirmation. See "Items to confirm with SVC" in the research PDF.
- **Posters:** the official posters in `public/posters/` are Wikipedia's fair-use copies (upscaled). Title logos come from TMDB ("This product uses the TMDB API but is not endorsed or certified by TMDB"); confirm SVC may use them too. SVC must approve their use, ideally supplying its own high-resolution posters and title logos.
- **Assets:** replace trailer thumbnails with approved posters/stills, the emblem with the vector logo, and the Dil Raju portrait (it carries a source watermark) with an approved master.
