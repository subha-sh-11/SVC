"use client";

import Image from "next/image";
import Link from "next/link";
import type { Film } from "@/data/types";
import { focal } from "@/data/focal";
import { filmPosters } from "@/data/posters";
import { cn } from "@/lib/utils";

export type TileSize = "regular" | "large" | "wide";

/** Width / height of the poster area for each tile shape (rows are 1.5 columns tall). */
const FRAME = { portrait: 0.68, landscape: 1.36 } as const;

/** Devotional colour pairs for titles that have no poster: saffron, kumkum, Vishnu's blue, tulsi, turmeric. */
const PALETTES = [
  { from: "#c2520e", to: "#3a1405", ink: "#ffe9b0" },
  { from: "#a3192a", to: "#2a0708", ink: "#ffd873" },
  { from: "#21477f", to: "#0b1530", ink: "#f2c230" },
  { from: "#3d6b33", to: "#0f1f0c", ink: "#ffe9b0" },
  { from: "#b9840f", to: "#4a2805", ink: "#fff5e6" },
];
const paletteFor = (slug: string) => PALETTES[[...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTES.length];

/** Does the film's official poster run wider than it is tall? */
export function hasLandscapePoster(slug: string) {
  const p = filmPosters[slug];
  return Boolean(p && p.w > p.h);
}

/**
 * The film's official poster, never cropped: when its shape differs from the tile's, the
 * whole poster sits over a soft blur of itself. Without a poster, a designed one in
 * temple colours.
 */
export function PosterArt({ film, sizes, priority, frame = "portrait" }: { film: Film; sizes: string; priority?: boolean; frame?: keyof typeof FRAME }) {
  const poster = filmPosters[film.slug];
  if (poster) {
    const target = FRAME[frame];
    const fits = Math.abs(poster.w / poster.h - target) / target <= 0.08;
    if (fits) return <Image src={poster.lg} alt="" fill sizes={sizes} priority={priority} className="object-cover" />;
    return (
      <>
        <Image src={poster.sm} alt="" fill sizes="200px" aria-hidden="true" className="scale-125 object-cover opacity-80 blur-2xl" />
        <Image src={poster.lg} alt="" fill sizes={sizes} priority={priority} className="object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]" />
      </>
    );
  }
  const p = paletteFor(film.slug);
  const fx = film.image ? (focal[film.image]?.x ?? 0.5) : 0.5;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `radial-gradient(120% 75% at 50% 0%, ${p.from}, ${p.to} 78%)` }}>
      {film.image ? (
        <Image
          src={film.image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover [mask-image:linear-gradient(to_bottom,#000_42%,transparent_76%)]"
          style={{ objectPosition: `${Math.round(fx * 100)}% 30%` }}
        />
      ) : (
        <Image src="/brand/svc-deity.png" alt="" width={606} height={906} className="absolute top-[14%] left-1/2 h-[19%] w-auto -translate-x-1/2 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]" />
      )}
      <div className="pointer-events-none absolute inset-[5%] rounded-[3px] border" style={{ borderColor: `${p.ink}66` }} />
      <div className="absolute inset-x-[11%] bottom-[11%] text-center">
        <p className="display text-[clamp(1rem,1.7cqw,1.8rem)] leading-[1.02] [text-wrap:balance] text-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{film.title}</p>
        <p className="mt-2 font-script text-[0.8rem]" style={{ color: `${p.ink}b3` }}>
          {film.year}
        </p>
      </div>
    </div>
  );
}

/**
 * A film on the shelf: its poster, with the title and year beneath. On hover it turns
 * over to a short note about the film; a click opens the preview. Hits are large
 * (2x2, or 2x1 when their poster is landscape); everything else is a regular poster.
 */
export function FilmTile({
  film,
  onOpen,
  priority,
  size = "regular",
  calm = false,
}: {
  film: Film;
  onOpen: (film: Film, from: HTMLElement, viaKeyboard: boolean) => void;
  priority?: boolean;
  size?: TileSize;
  /** Just after a preview closes: stay on the poster even if the pointer is resting here. */
  calm?: boolean;
}) {
  const big = size !== "regular";
  const sizes =
    size === "regular" ? "(min-width: 1280px) 16vw, (min-width: 1024px) 19vw, (min-width: 640px) 31vw, 46vw" : "(min-width: 1280px) 34vw, (min-width: 1024px) 40vw, (min-width: 640px) 64vw, 96vw";

  return (
    <article className="group relative flex h-full flex-col">
      <div className="min-h-0 flex-1 [perspective:1600px]">
        {/* Turns over under the pointer, or when reached with the keyboard (not merely because it holds focus after a click) */}
        <div
          className={cn(
            "relative h-full transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] group-has-[:focus-visible]:[transform:rotateY(180deg)]",
            !calm && "group-hover:[transform:rotateY(180deg)]",
          )}
        >
          {/* Front: the poster */}
          <div className="absolute inset-0 overflow-hidden rounded-[8px] bg-paper/[0.06] shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] [backface-visibility:hidden]">
            <PosterArt film={film} sizes={sizes} priority={priority} frame={size === "wide" ? "landscape" : "portrait"} />
          </div>

          {/* Back: a short note about the film */}
          <div
            className={cn(
              "theme-light absolute inset-0 flex flex-col overflow-hidden rounded-[8px] bg-white text-paper shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)] ring-1 ring-black/10 [backface-visibility:hidden] [transform:rotateY(180deg)]",
              big ? "p-[clamp(1rem,2.4cqw,2rem)]" : "p-[9%]",
            )}
          >
            <p className={cn("display leading-[1.05] font-semibold", big ? "text-[clamp(1.3rem,2.2cqw,2.2rem)]" : "text-[clamp(1rem,1.3cqw,1.25rem)]")}>{film.title}</p>
            <p className={cn("mt-1.5 text-dim", big ? "text-[0.85rem]" : "text-[0.7rem]")}>
              {film.year}
              {film.genre && <> · {film.genre}</>}
            </p>
            {film.premise && (
              <p className={cn("mt-3 leading-relaxed text-paper/80", big ? "text-[clamp(0.9rem,1.15cqw,1.08rem)]" : "line-clamp-6 text-[clamp(0.74rem,0.88cqw,0.84rem)]")}>{film.premise}</p>
            )}
            <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[0.64rem] font-bold tracking-[0.16em] text-saffron-deep uppercase">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5-9-5.5z" />
              </svg>
              Preview
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-[var(--cap)] items-end justify-between gap-3 pb-0.5">
        <h3 className={cn("min-w-0 truncate font-medium text-paper", big ? "text-[clamp(0.95rem,1.15cqw,1.15rem)]" : "text-[clamp(0.86rem,1cqw,1rem)]")}>{film.title}</h3>
        <span className="shrink-0 text-[0.85rem] text-dim tabular-nums">{film.year}</span>
      </div>

      {/* The whole tile opens the preview */}
      <button
        type="button"
        // A click from Enter or Space has no pointer behind it (detail 0)
        onClick={(e) => onOpen(film, e.currentTarget, e.detail === 0)}
        aria-haspopup="dialog"
        aria-label={`${film.title} (${film.year}): open preview`}
        className="absolute inset-0 rounded-[8px] focus-visible:outline-offset-4"
      />
    </article>
  );
}

/** Ends the shelf, in whatever space the last film leaves: what SVC is making next. */
export function ComingSoonTile({ titles }: { titles: { title: string; release: string | null }[] }) {
  return (
    <article className="relative flex h-full flex-col">
      <div className="@container flex min-h-0 flex-1 flex-col justify-center rounded-[8px] border border-paper/15 p-[clamp(1rem,6cqw,2.5rem)]">
        <p className="text-[0.62rem] font-bold tracking-[0.26em] text-saffron-deep uppercase">Coming soon</p>
        <ul className="mt-4 space-y-2 text-[clamp(0.85rem,4cqw,1.05rem)] @xl:text-[clamp(0.9rem,2.2cqw,1.1rem)]">
          {titles.map((t) => (
            <li key={t.title} className="flex items-baseline justify-between gap-4 border-b border-paper/[0.08] pb-2">
              <span className="truncate font-medium text-paper">{t.title}</span>
              <span className="shrink-0 text-[0.85em] text-dim">{t.release ?? "TBA"}</span>
            </li>
          ))}
        </ul>
        <Link href="/upcoming" className="mt-5 self-start text-[0.7rem] font-bold tracking-[0.18em] text-saffron-deep uppercase hover:text-paper">
          Upcoming films →
        </Link>
      </div>
      <div className="h-[var(--cap)]" />
    </article>
  );
}
