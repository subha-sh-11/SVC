import { films } from "./films";
import { awards } from "./awards";
import { upcoming } from "./upcoming";
import { timeline } from "./timeline";
import { distribution } from "./distribution";
import { assets } from "./assets";
import type { Film, FilmCategory } from "./types";

export { films, awards, upcoming, timeline, distribution, assets };
export type * from "./types";

const bySlug = new Map(films.map((f) => [f.slug, f]));

export function getFilm(slug: string) {
  return bySlug.get(slug) ?? null;
}

export function getFilms(slugs: string[]) {
  return slugs.map((s) => bySlug.get(s)).filter((f): f is Film => Boolean(f));
}

export function awardsForFilm(slug: string) {
  return awards.filter((a) => a.filmSlug === slug);
}

export function filmsByCategory(cat: FilmCategory) {
  return films.filter((f) => f.category === cat);
}

/** Previous / next film in chronological catalogue order. */
export function neighbours(slug: string) {
  const i = films.findIndex((f) => f.slug === slug);
  return {
    prev: i > 0 ? films[i - 1] : null,
    next: i >= 0 && i < films.length - 1 ? films[i + 1] : null,
  };
}

export const CATEGORY_LABEL: Record<FilmCategory, string> = {
  core: "SVC Productions",
  presentation: "Presentations & Versions",
  related: "Dil Raju Productions",
};

export const stats = {
  coreFilms: films.filter((f) => f.category === "core").length,
  allFilms: films.length,
  nationalAwards: awards.filter((a) => a.group === "National Film Awards" && a.scope?.startsWith("producer_company")).length,
  awardRecords: awards.length,
  distribution: distribution.length,
  images: assets.length,
};
