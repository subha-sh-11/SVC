import { upcoming } from "./upcoming";

/**
 * The home page's showreel: what is coming first (glimpses of the announced films), then the
 * released films' trailers, back to back. Every clip is served from the site (public/video/reel)
 * so it plays sharp: 1080p for wide screens, 720p for phones.
 */

/** Films with a trailer segment on the site: 13 seconds from each official trailer, letterbox cropped. */
const REEL_FILMS = new Set([
  "sankranthiki-vasthunam-2025",
  "game-changer-2025",
  "fidaa-2017",
  "maharshi-2019",
  "vakeel-saab-2021",
  "f2-fun-and-frustration-2019",
]);

/** Clips that also come in 4K (their sources are 4K): served only to 4K screens. */
const UHD = new Set(["sankranthiki-vasthunam-2025", "game-changer-2025", "maharshi-2019", "vakeel-saab-2021", "rowdy-janardhana", "yellamma", "dethadi", "markandeya"]);
const uhdFor = (slug: string) => (UHD.has(slug) ? `/video/reel/${slug}-2160.mp4` : undefined);

export function reelFilm(slug: string) {
  return REEL_FILMS.has(slug) ? { hd: `/video/reel/${slug}-1080.mp4`, sd: `/video/reel/${slug}-720.mp4`, uhd: uhdFor(slug) } : null;
}

export type ReelUpcoming = {
  slug: string;
  title: string;
  /** What the official video is, for the lightbox. */
  label: string;
  youtubeId: string;
  /** The banner it comes from. */
  banner: string;
  /** When it is due, as announced. */
  when: string;
  /** The same, in a word or two. */
  short: string;
  director: string | null;
  cast: string[];
  hd: string;
  sd: string;
  /** 4K, where the source is 4K. */
  uhd?: string;
  poster: string;
};

// Each clip is the end of the film's official glimpse or announcement (ending on its title), from
// Dil Raju's / SVC's own channels. Release windows follow the upcoming register (upcoming.ts).
const UPCOMING_REEL: Array<Pick<ReelUpcoming, "slug" | "label" | "youtubeId" | "banner" | "when" | "short">> = [
  { slug: "rowdy-janardhana", label: "Title glimpse", youtubeId: "Q1s_CWfGAHk", banner: "SVC Production", when: "April 2027", short: "Apr 2027" },
  { slug: "svc63", label: "Release date announcement", youtubeId: "VGwDSrYUfWE", banner: "SVC Production", when: "Eid 2027", short: "Eid 2027" },
  { slug: "yellamma", label: "Glimpse", youtubeId: "6SaQ3mey3-A", banner: "SVC Production", when: "Releasing 5 March 2027", short: "5 Mar 2027" },
  { slug: "dethadi", label: "Glimpse", youtubeId: "ldJToRagYqs", banner: "SVC Production", when: "Coming soon", short: "Soon" },
  { slug: "markandeya", label: "Title glimpse", youtubeId: "ryWpShUe1Jc", banner: "Dil Raju Dreams", when: "Planned for Mahashivaratri 2027", short: "Shivaratri 2027" },
];

export const reelUpcoming: ReelUpcoming[] = UPCOMING_REEL.flatMap((u) => {
  const p = upcoming.find((x) => x.slug === u.slug);
  if (!p) return [];
  return [
    {
      ...u,
      title: p.title,
      director: p.director ?? null,
      cast: p.cast ?? [],
      hd: `/video/reel/${u.slug}-1080.mp4`,
      sd: `/video/reel/${u.slug}-720.mp4`,
      uhd: uhdFor(u.slug),
      poster: `/video/reel/${u.slug}-poster.jpg`,
    },
  ];
});
