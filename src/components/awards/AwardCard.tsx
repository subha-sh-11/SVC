"use client";

import Link from "next/link";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AwardSet, PosterArt } from "./AwardPoster";
import { shortRecipient } from "./AwardPoster";

const INK = "#1a0f08";
/** Awards listed before "+ n more". */
const SHOWN = 3;
/** Personal honours with no photograph of their own: Dil Raju. */
const PERSONAL: NonNullable<PosterArt> = { src: "/images/people/dil-raju-stage.jpg", focus: "50% 22%" };

/**
 * Footage of the presentation, over its first frame: it loads only as it nears the screen and
 * plays silently, round and round, only while on screen.
 */
function CardClip({ src, focus }: { src: string; focus?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const near = useInView(ref, { margin: "300px 0px 300px 0px" });
  const onScreen = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [load, setLoad] = useState(false);
  useEffect(() => {
    if (near) setLoad(true);
  }, [near]);
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    if (onScreen && !reduce) v.play().catch(() => undefined);
    else v.pause();
  }, [onScreen, reduce, load]);
  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      muted
      loop
      playsInline
      preload={load ? "auto" : "none"}
      aria-hidden="true"
      style={{ objectPosition: focus ?? "50% 40%" }}
      className="absolute inset-0 h-full w-full max-w-none object-cover"
    />
  );
}

/**
 * One award set (what a film won from one body in one year, or a personal honour), plainly: the
 * picture, a line saying which awards and when, the film's name in condensed capitals, and each
 * award with who won it.
 */
export function AwardCard({ set, art, priority = false }: { set: AwardSet; art: PosterArt; priority?: boolean }) {
  const [open, setOpen] = useState(false);
  const pic = art ?? (set.scope === "personal" || !set.filmSlug ? PERSONAL : null);
  const selection = set.awards.every((a) => a.outcome === "Selected");
  const n = set.awards.length;
  const when = [set.edition, set.year].filter(Boolean).join(" · ");
  const title = set.film ?? "Dil Raju";
  const list = open ? set.awards : set.awards.slice(0, SHOWN);
  const more = n - SHOWN;

  const picture = (
    <div className="relative aspect-[3/2] overflow-hidden bg-[#f3ebdf]">
      {!pic && (
        // No photograph of the award or its winner: the award, set in type.
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-[#c4520c]" />
          <span className="mt-4 font-display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-tight text-[#3b1a07] italic">{set.label}</span>
          {set.year && <span className="mt-2 font-title text-[clamp(2.4rem,4vw,3.4rem)] leading-none text-transparent [-webkit-text-stroke:1.2px_#c4520c]">{set.year}</span>}
        </div>
      )}
      {pic && (
        // Pictures are stored at card size, so they load as they are (no resizing on the way).
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized card image
        <img
          src={pic.src}
          alt=""
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          style={{ objectPosition: pic.focus ?? "50% 30%", ...(pic.zoom ? { scale: pic.zoom, transformOrigin: pic.focus } : {}) }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      )}
      {pic?.clip && <CardClip src={pic.clip} focus={pic.focus} />}
      {pic?.clip && (
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[max(0.56rem,9px)] font-bold tracking-[0.16em] text-white uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d3d]" aria-hidden="true" />
          Ceremony footage
        </span>
      )}
    </div>
  );

  return (
    <article className="group" style={{ color: INK }}>
      {set.filmSlug ? (
        <Link href={`/films/${set.filmSlug}`} tabIndex={-1} aria-hidden="true" className="block">
          {picture}
        </Link>
      ) : (
        picture
      )}

      <p className="mt-4 flex items-baseline justify-between gap-4 text-[max(0.62rem,9px)] font-semibold tracking-[0.18em] text-[#8a6a52] uppercase">
        <span className="min-w-0 truncate">
          {set.label}
          {when && ` · ${when}`}
        </span>
        <span className="shrink-0">{selection ? "Selection" : `${n} ${n === 1 ? "win" : "wins"}`}</span>
      </p>

      <h3 className="mt-2 font-title text-[clamp(1.5rem,2.1vw,1.9rem)] leading-[0.95] tracking-[0.005em] uppercase">
        {set.filmSlug ? (
          <Link href={`/films/${set.filmSlug}`} className="transition-colors hover:text-saffron-deep">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      <ul className="mt-3 space-y-1.5 border-t border-[#1a0f08]/10 pt-3">
        {list.map((a) => {
          const who = shortRecipient(a);
          return (
            <li key={a.id} className="text-[0.88rem] leading-snug">
              <span className="font-medium">{a.category}</span>
              {who && <span className="text-[#7a5a44]"> — {who}</span>}
            </li>
          );
        })}
      </ul>
      {more > 0 && (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-2.5 text-[max(0.64rem,9px)] font-bold tracking-[0.16em] text-saffron-deep uppercase hover:underline">
          {open ? "Show fewer" : `+ ${more} more`}
        </button>
      )}
      {(pic?.depicts || pic?.credit) && (
        <p className="mt-2 line-clamp-2 text-[max(0.62rem,9px)] leading-relaxed text-[#a08670]" title={[pic.depicts, pic.credit && `(${pic.clip ? "Footage" : "Photo"}: ${pic.credit})`].filter(Boolean).join(" ")}>
          {pic.depicts}
          {pic.depicts && pic.credit && " "}
          {pic.credit && <span className="whitespace-nowrap">({pic.clip ? "Footage" : "Photo"}: {pic.credit})</span>}
        </p>
      )}
    </article>
  );
}
