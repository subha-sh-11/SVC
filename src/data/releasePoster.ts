import type { DistributionRecord } from "./types";
import { distributionPosters } from "./distributionPosters";
import { filmPosters, posterWall } from "./posters";

/** A release's poster: SVC's own artwork for its own films, otherwise the distributed film's. */
export function releasePoster(r: Pick<DistributionRecord, "film" | "filmSlug">): { src: string; position?: string } | null {
  const own = r.filmSlug ? filmPosters[r.filmSlug] : undefined;
  if (own) return { src: own.sm, position: posterWall.find((t) => t.slug === r.filmSlug)?.position };
  const other = distributionPosters[r.film];
  return other ? { src: other.src } : null;
}
