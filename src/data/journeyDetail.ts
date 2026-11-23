// What each journey milestone shows when it is opened: the films behind it (with posters,
// directors, cast and story), the others from the same years, a quote where there is one,
// and where to go next. Built on the server from the catalogue; hand-picked films below.
import type { Milestone, MilestoneDetail, MilestoneFilm } from "./types";
import { films } from "./films";
import { upcoming } from "./upcoming";
import { distribution } from "./distribution";
import { distributionPosters } from "./distributionPosters";
import { filmPosters, posterWall } from "./posters";
import { releasePoster } from "./releasePoster";
import { speeches } from "./speech";
import { territoryShort } from "@/lib/territory";

/** The first and last years a milestone's date covers ("2007 to 2011", "April 2003", "2020-09-05"). */
function yearsOf(date: string): [number, number] {
  const ys = date.match(/\d{4}/g)?.map(Number) ?? [];
  return [ys[0] ?? 0, ys[ys.length - 1] ?? 0];
}

/** The films each production milestone is about, keyed by its title in timeline.ts. */
const PRODUCTION_FILMS: Record<string, string[]> = {
  "Dil begins the production journey": ["dil-2003"],
  "Arya introduces Sukumar": ["arya-2004"],
  "Bhadra introduces Boyapati Srinu": ["bhadra-2005"],
  Bommarillu: ["bommarillu-2006"],
  "More directorial debuts": ["munna-2007", "kotha-bangaru-lokam-2008", "josh-2009", "oh-my-friend-2011"],
  "Seethamma Vakitlo Sirimalle Chettu": ["seethamma-vakitlo-sirimalle-chettu-2013"],
  "A busy year of six core releases": [
    "shatamanam-bhavati-2017",
    "nenu-local-2017",
    "dj-duvvada-jagannadham-2017",
    "fidaa-2017",
    "raja-the-great-2017",
    "mca-middle-class-abbayi-2017",
  ],
  "National recognition for Shatamanam Bhavati": ["shatamanam-bhavati-2017"],
  "F2 and Maharshi": ["f2-fun-and-frustration-2019", "maharshi-2019"],
  "V premieres digitally": ["v-2020"],
  "National recognition for Maharshi": ["maharshi-2019"],
  "Hindi films in the wider production network": ["jersey-hindi-2022", "hit-the-first-case-hindi-2022"],
  "Varisu and two decades of production": ["varisu-2023"],
  "Balagam under Dil Raju Productions": ["balagam-2023"],
  "Game Changer and SVC50": ["game-changer-2025"],
  "Sankranthiki Vasthunam": ["sankranthiki-vasthunam-2025"],
};

/** Announced projects behind a milestone, by their slugs in upcoming.ts. */
const PRODUCTION_UPCOMING: Record<string, string[]> = {
  "Markandeya announced through DilRaju Dreams": ["markandeya"],
  "New Telugu and Hindi announcements": ["rowdy-janardhana", "yellamma", "svc63", "svc64"],
};

const PRODUCTION_LINKS: Record<string, { href: string; label: string }[]> = {
  Bommarillu: [{ href: "/awards", label: "Its awards" }],
  "National recognition for Shatamanam Bhavati": [{ href: "/awards", label: "All awards" }],
  "National recognition for Maharshi": [{ href: "/awards", label: "All awards" }],
  "Dil Raju Dreams platform launch": [{ href: "https://www.dilrajudreams.com/", label: "DilRaju Dreams" }],
  "Markandeya announced through DilRaju Dreams": [{ href: "/upcoming", label: "Upcoming films" }],
  "New Telugu and Hindi announcements": [{ href: "/upcoming", label: "Upcoming films" }],
};

const UPCOMING_POSTERS: Record<string, string> = {
  dethadi: "/images/upcoming-posters/dethadi.jpg",
  markandeya: "/images/upcoming-posters/markandeya.jpg",
  "rowdy-janardhana": "/images/upcoming-posters/rowdy-janardhana.jpg",
  svc63: "/images/upcoming-posters/svc63.jpg",
  yellamma: "/images/upcoming-posters/yellamma.jpg",
};

function filmCard(slug: string, full: boolean): MilestoneFilm | null {
  const f = films.find((x) => x.slug === slug);
  if (!f) return null;
  const p = filmPosters[f.slug];
  return {
    title: f.title,
    year: f.year,
    poster: p ? { src: p.sm, position: posterWall.find((t) => t.slug === f.slug)?.position } : f.image ? { src: f.image } : null,
    href: `/films/${f.slug}`,
    note: f.director ? `Directed by ${f.director}` : undefined,
    ...(full ? { premise: f.premise ?? undefined, cast: f.cast.slice(0, 4) } : {}),
  };
}

function upcomingCard(slug: string): MilestoneFilm | null {
  const u = upcoming.find((x) => x.slug === slug);
  if (!u) return null;
  const src = UPCOMING_POSTERS[u.slug] ?? u.image;
  return {
    title: u.title,
    year: u.release ?? "Announced",
    poster: src ? { src } : null,
    href: "/upcoming",
    note: u.director ? `Directed by ${u.director}` : undefined,
    cast: u.cast.slice(0, 3),
  };
}

/** A production milestone, opened: its films in full, then the banner's other films of those years. */
export function productionDetail(m: Milestone): MilestoneDetail {
  const featured = [
    ...(PRODUCTION_FILMS[m.title] ?? []).flatMap((s) => filmCard(s, true) ?? []),
    ...(PRODUCTION_UPCOMING[m.title] ?? []).flatMap((s) => upcomingCard(s) ?? []),
  ];
  const detail: MilestoneDetail = { featured, links: PRODUCTION_LINKS[m.title] };
  if (PRODUCTION_FILMS[m.title]?.length) {
    const [from, to] = yearsOf(m.date);
    const taken = new Set(PRODUCTION_FILMS[m.title]);
    const others = films
      .filter((f) => f.category !== "related" && f.year >= from && f.year <= to && !taken.has(f.slug))
      .sort((a, b) => a.year - b.year)
      .flatMap((f) => filmCard(f.slug, false) ?? []);
    if (others.length) detail.more = { label: from === to ? `Also from SVC in ${from}` : `Also from SVC, ${from} to ${to}`, films: others };
  }
  return detail;
}

/** A distribution milestone, opened: every film released in its years, with where it went out. */
export function distributionDetail(m: Milestone): MilestoneDetail {
  const [from, to] = yearsOf(m.date);
  const released = distribution
    .filter((d) => d.year >= from && d.year <= to)
    .sort((a, b) => a.year - b.year || a.film.localeCompare(b.film))
    .map<MilestoneFilm>((r) => ({
      title: r.film,
      year: r.year,
      poster: releasePoster(r),
      href: r.filmSlug ? `/films/${r.filmSlug}` : undefined,
      note: territoryShort(r.territory),
    }));
  const detail: MilestoneDetail = {};
  if (released.length) detail.more = { label: from === to ? `Released in ${from}` : `Released from ${from} to ${to}`, films: released };
  if (from === 1997) {
    const speech = speeches.find((s) => s.key === "journey");
    if (speech) detail.quote = { text: speech.quote, by: `Dil Raju, ${speech.context}${speech.translated ? " (translated from Telugu)" : ""}` };
    const p = distributionPosters["Pelli Pandiri"];
    detail.featured = [{ title: "Pelli Pandiri", year: 1997, poster: p ? { src: p.src } : null, note: "The film he credits for the whole journey" }];
  }
  return detail;
}
