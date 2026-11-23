export type FilmCategory = "core" | "presentation" | "related";

export interface Video {
  label: string;
  youtubeId: string;
}

export interface Film {
  slug: string;
  title: string;
  year: number;
  category: FilmCategory;
  roleLabel: string;
  role: string;
  director: string | null;
  cast: string[];
  premise: string | null;
  language: string;
  languageKey: "Telugu" | "Tamil" | "Hindi" | string;
  genre: string | null;
  releaseDate: string | null;
  datePrecision: string | null;
  altNames: string[];
  producers: string | null;
  banners: string | null;
  music: string | null;
  image: string | null;
  gallery: string[];
  trailer: string | null;
  videos: Video[];
  isSeries: boolean;
  sources: string[];
}

export interface Award {
  id: string;
  film: string | null;
  filmSlug: string | null;
  filmYear: number | string | null;
  body: string | null;
  group: string;
  category: string | null;
  recipient: string | null;
  outcome: string | null;
  awardYear: number | string | null;
  eventYear: number | null;
  edition: string | null;
  bannerScope: string | null;
  companyRole: string | null;
  scope: string | null;
  evidence: string | null;
  sources: string[];
}

export interface UpcomingProject {
  slug: string;
  title: string;
  director: string | null;
  cast: string[];
  banner: string | null;
  role: string | null;
  release: string | null;
  status: string | null;
  altNames: string[];
  image: string | null;
  videos: Video[];
  sources: string[];
}

export interface Milestone {
  date: string;
  title: string;
  type: string | null;
  description: string | null;
  image?: string | null;
  filmSlug?: string | null;
  /** Shown in place of a picture: the films' posters, fanned out (the distribution journey). */
  posters?: { src: string; title: string; position?: string }[];
  /** Over the picture's corner, e.g. "11 releases". */
  badge?: string;
  /** What the milestone shows when it is opened (see journeyDetail.ts). */
  detail?: MilestoneDetail;
}

/** A film as it appears inside an opened milestone. */
export interface MilestoneFilm {
  title: string;
  year: number | string;
  poster: { src: string; position?: string } | null;
  href?: string;
  /** A short line under the title: who directed it, or where it was released. */
  note?: string;
  premise?: string;
  cast?: string[];
}

/** The fuller story of a milestone: a quote, its films, and the others from the same years. */
export interface MilestoneDetail {
  quote?: { text: string; by: string };
  featured?: MilestoneFilm[];
  more?: { label: string; films: MilestoneFilm[] };
  links?: { href: string; label: string }[];
}

export interface DistributionRecord {
  film: string;
  year: number;
  territory: string | null;
  status: string | null;
  role: string | null;
  filmSlug: string | null;
}

export interface Asset {
  id: string;
  film: string | null;
  title: string | null;
  type: string | null;
  src: string | null;
  width: number;
  height: number;
  rights: string | null;
  sourcePage: string | null;
  bannerScope: string | null;
}
