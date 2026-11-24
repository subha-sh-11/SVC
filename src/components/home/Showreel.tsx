"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntroDone } from "@/components/providers/IntroProvider";
import { useTrailer, useTrailerOpen } from "@/components/providers/TrailerProvider";
import { PlayIcon } from "@/components/ui/Buttons";
import { trailerFrames } from "@/data/frames";
import { posterWall, titleLogos } from "@/data/posters";
import { reelFilm, reelUpcoming, type ReelUpcoming } from "@/data/reel";
import type { Film } from "@/data/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Crossfade from one clip to the next. */
const FADE_S = 0.9;
/** A film's synopsis steps aside once its trailer has been on screen this long. */
const SETTLE_S = 6;
/** Phones: the clips play in a 16:9 band at the top of the section; the glow of the clip fills the rest, behind the words. */
const BAND_TOP = 0;
const GLOW = { w: 48, h: 27, everyMs: 120 };
const POSTERS = new Map(posterWall.filter((t) => t.official).map((t) => [t.slug, t.lg]));

type Item = { key: string; hd: string; sd: string; uhd?: string; poster: string; title: string; film?: Film; up?: ReelUpcoming };
type Role = "current" | "next" | "prev";

function ArrowIcon({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", back && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v6M12 7.5v.5" strokeLinecap="round" />
    </svg>
  );
}

/** A film's billboard: title logo, a line about it, and the ways in. */
function FilmBillboard({ film, settled, onPlay }: { film: Film; settled: boolean; onPlay: () => void }) {
  const logo = titleLogos[film.slug];
  return (
    <div className="min-w-0 max-w-[min(100%,40rem)]">
      <p className="flex items-center gap-2.5 text-[0.62rem] font-bold tracking-[0.3em] text-white/80 uppercase sm:text-[0.7rem] sm:tracking-[0.42em]">
        <span aria-hidden="true" className="svc-mark svc-mark--bright block aspect-[2003/736] h-[0.9rem] sm:h-[1.05rem]" />
        Film
      </p>
      <h2 className={cn(logo ? "sr-only" : "mt-3 text-[1.8rem] leading-[0.98] font-semibold tracking-[-0.02em] sm:mt-4 sm:text-[clamp(2.2rem,5.4vw,5rem)]")}>{film.title}</h2>
      {logo && (
        <motion.div className="mt-3 origin-bottom-left sm:mt-4" animate={{ scale: settled ? 0.78 : 1 }} transition={{ duration: 1.2, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- official title logo, sized by height */}
          <img src={logo} alt="" className="h-[52px] w-auto max-w-full sm:h-[clamp(64px,15vh,180px)] object-contain object-left drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)]" />
        </motion.div>
      )}
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={settled ? { opacity: 0, height: 0, marginTop: 0 } : { opacity: 1, height: "auto", marginTop: 18 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <p className="text-[0.72rem] font-semibold text-white/70 sm:text-[0.78rem]">
          <span className="text-[#46d369]">{film.year}</span>
          {film.genre && <span> · {film.genre}</span>}
          {film.director && <span> · Directed by {film.director}</span>}
        </p>
        {film.premise && (
          <p className="mt-2 line-clamp-2 text-[0.84rem] leading-snug sm:mt-2.5 sm:line-clamp-3 sm:text-[clamp(0.95rem,1.25vw,1.2rem)] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">{film.premise}</p>
        )}
      </motion.div>
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
        {film.trailer && (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play the ${film.title} trailer`}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-white px-3.5 py-1.5 text-[0.78rem] font-semibold text-black transition-colors hover:bg-white/75 sm:gap-2.5 sm:px-7 sm:py-2.5 sm:text-lg"
          >
            <PlayIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            Play
          </button>
        )}
        <Link
          href={`/films/${film.slug}`}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-[rgba(109,109,110,0.7)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[rgba(109,109,110,0.45)] sm:gap-2.5 sm:px-7 sm:py-2.5 sm:text-lg"
        >
          <InfoIcon />
          More info
        </Link>
        <span className="text-[0.68rem] font-medium text-white/65 sm:text-[0.75rem] md:hidden">{film.roleLabel}</span>
      </div>
    </div>
  );
}

/** An upcoming film's billboard: coming soon, its title, when it is due, and the ways in. */
function UpcomingBillboard({ up, settled, onPlay }: { up: ReelUpcoming; settled: boolean; onPlay: () => void }) {
  const people = [up.cast.join(" · "), up.director ? `Directed by ${up.director}` : ""].filter(Boolean).join(" · ");
  return (
    <div className="min-w-0 max-w-[min(100%,42rem)]">
      <p className="flex items-center gap-2.5 text-[0.62rem] font-bold tracking-[0.3em] text-[#f2c230] uppercase sm:text-[0.7rem] sm:tracking-[0.42em]">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2c230] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f2c230]" />
        </span>
        Coming soon
      </p>
      <motion.h2
        className="mt-3 origin-bottom-left font-title text-[1.9rem] leading-[0.95] sm:mt-4 sm:text-[clamp(2.6rem,6vw,5.6rem)] tracking-[0.01em] text-white uppercase [text-shadow:0_6px_30px_rgba(0,0,0,0.55)]"
        animate={{ scale: settled ? 0.8 : 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {up.title}
      </motion.h2>
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={settled ? { opacity: 0, height: 0, marginTop: 0 } : { opacity: 1, height: "auto", marginTop: 16 }}
        transition={{ duration: 1, ease: EASE }}
      >
        <p className="text-[0.74rem] font-semibold text-white/75 sm:text-[0.82rem]">
          {/* Wide screens show when it is due in the corner card */}
          <span className="text-[#f2c230] md:hidden">
            {up.when}
            {people && " · "}
          </span>
          {people}
        </p>
      </motion.div>
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Play the ${up.title} ${up.label.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-white px-3.5 py-1.5 text-[0.78rem] font-semibold text-black transition-colors hover:bg-white/75 sm:gap-2.5 sm:px-7 sm:py-2.5 sm:text-lg"
        >
          <PlayIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          Play
        </button>
        <Link
          href={`/upcoming#${up.slug}`}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-[rgba(109,109,110,0.7)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-white transition-colors hover:bg-[rgba(109,109,110,0.45)] sm:gap-2.5 sm:px-7 sm:py-2.5 sm:text-lg"
        >
          <InfoIcon />
          More info
        </Link>
        <span className="text-[0.68rem] font-medium text-white/65 sm:text-[0.75rem] md:hidden">{up.banner}</span>
      </div>
    </div>
  );
}

/**
 * Phones: under the clip, in its glow: what it is and when, the title, who is in it, and the two ways
 * in. The glow fades into the page below.
 */
function PhoneDetails({ items, index, onPlay }: { items: Item[]; index: number; onPlay: () => void }) {
  const it = items[index];
  const up = it.up;
  const film = it.film;
  const people = up
    ? [up.cast.join(", "), up.director && `Directed by ${up.director}`].filter(Boolean).join(" · ")
    : film
      ? [film.genre, film.director && `Directed by ${film.director}`].filter(Boolean).join(" · ")
      : "";
  return (
    <div className="shell relative z-20 flex flex-col pb-20" style={{ paddingTop: "calc(56.25vw + 1.4rem)" }}>
      {/* A steady height whichever film is showing, so what is pinned above never shifts */}
      <div className="min-h-[12.5rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={it.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.25, ease: "easeIn" } }}
        >
          <p className="flex items-center gap-2 text-[max(0.6rem,9px)] font-bold tracking-[0.26em] uppercase">
            {up ? (
              <>
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2c230] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f2c230]" />
                </span>
                <span className="text-[#f2c230]">Coming soon</span>
                {up.when.toLowerCase() !== "coming soon" && <span className="text-white/55">· {up.when}</span>}
              </>
            ) : (
              <>
                <span className="text-[#f2c230]">{film?.roleLabel}</span>
                <span className="text-white/55">· {film?.year}</span>
              </>
            )}
          </p>
          <h2 className="mt-2.5 font-title text-[1.7rem] leading-[1.02] tracking-[0.01em] text-white uppercase">{it.title}</h2>
          {people && <p className="mt-2 line-clamp-2 text-[0.74rem] leading-snug text-white/65">{people}</p>}
          {film?.premise && <p className="mt-2 line-clamp-2 text-[0.8rem] leading-snug text-white/85">{film.premise}</p>}
          <div className="mt-4 flex items-center gap-7">
            <button type="button" onClick={onPlay} className="inline-flex items-center gap-2 py-1.5 text-[0.7rem] font-bold tracking-[0.22em] text-white uppercase">
              <PlayIcon className="h-2.5 w-2.5" />
              Play
            </button>
            <Link href={up ? `/upcoming#${up.slug}` : `/films/${film?.slug}`} className="inline-flex items-center gap-2 py-1.5 text-[0.7rem] font-bold tracking-[0.22em] text-white/75 uppercase">
              More info <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * The showreel, full screen: glimpses of the films on the way first, then the released films'
 * trailers, one after another, round and round. Each clip plays to its end and crossfades into the
 * next, which has been loading underneath. It plays with sound (browsers allow it once the visitor
 * has clicked, tapped or pressed a key on the page; until then a sound button shows), pauses off
 * screen and while a full trailer is open.
 */
export function Showreel({
  films,
  overlap = false,
  fadeTo,
}: {
  films: Film[];
  /** Phones: it slides up over the pinned section before it. */
  overlap?: boolean;
  /** Phones: the colour of the section below, which the glow fades into. */
  fadeTo?: string;
}) {
  const items = useMemo<Item[]>(
    () => [
      ...reelUpcoming.map((u) => ({ key: `up-${u.slug}`, hd: u.hd, sd: u.sd, uhd: u.uhd, poster: u.poster, title: u.title, up: u })),
      ...films.flatMap((f) => {
        const clip = reelFilm(f.slug);
        return clip ? [{ key: f.slug, ...clip, poster: trailerFrames[f.slug]?.src ?? f.image ?? "", title: f.title, film: f }] : [];
      }),
    ],
    [films],
  );
  const n = items.length;

  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const introDone = useIntroDone();
  const modalOpen = useTrailerOpen();
  const openTrailer = useTrailer();
  const onScreen = useInView(sectionRef, { amount: 0.4 });
  // The clips start loading a screen or so before the section arrives.
  const near = useInView(sectionRef, { margin: "150% 0px 150% 0px" });
  const [approached, setApproached] = useState(false);
  useEffect(() => {
    if (near) setApproached(true);
  }, [near]);
  // 4K screens (and a connection that can carry it) get the 4K clips, where there are any.
  const [uhdScreen, setUhdScreen] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = Boolean(conn?.saveData) || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
    setUhdScreen(!slow && window.screen.width * (window.devicePixelRatio || 1) >= 2600);
  }, []);
  // A 4K clip that will not load falls back to its 1080p version.
  const [uhdFailed, setUhdFailed] = useState<ReadonlySet<string>>(() => new Set());
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // The clip playing, and the one fading out over it. The next clip loads underneath, ready.
  const [{ index, prev }, setSlide] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  const next = (index + 1) % n;
  const item = items[index];
  const indexRef = useRef(index);
  indexRef.current = index;
  const live = introDone && onScreen && !modalOpen;

  const goRef = useRef<(i: number) => void>(() => undefined);
  useEffect(() => {
    if (!onScreen || modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") goRef.current(indexRef.current + 1);
      else if (e.key === "ArrowLeft") goRef.current(indexRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onScreen, modalOpen]);

  const go = useCallback(
    (i: number) =>
      setSlide((s) => {
        const k = ((i % n) + n) % n;
        return k === s.index ? s : { index: k, prev: s.index };
      }),
    [n],
  );
  goRef.current = go;
  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(() => setSlide((s) => ({ ...s, prev: null })), FADE_S * 1000 + 150);
    return () => window.clearTimeout(t);
  }, [prev, index]);

  // Whether the film's synopsis has stepped aside.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    setSettled(false);
  }, [index]);

  // ---- Sound: on by itself while the reel is on screen. Browsers allow it once the visitor has
  // clicked, tapped or pressed a key on the page; if it is refused, the reel carries on muted and
  // the sound comes in at their next tap. ----
  const [soundOn, setSound] = useState(false);
  const soundRef = useRef(false);
  soundRef.current = soundOn;
  const [blocked, setBlocked] = useState(false);
  /** The visitor turned the sound off themselves: leave it off. */
  const userMuted = useRef(false);
  useEffect(() => {
    setSound(live && !userMuted.current);
  }, [live]);

  const start = useCallback((v: HTMLVideoElement) => {
    v.muted = !soundRef.current;
    v.play().catch(() => {
      if (v.muted) return;
      v.muted = true;
      v.play().catch(() => undefined);
      setSound(false);
      setBlocked(true);
    });
  }, []);

  // Play the current clip (from the top when it has just come round), and keep the rest quiet.
  const shownIndex = useRef(-1);
  useEffect(() => {
    const cur = videos.current.get(item.key);
    const fading = prev !== null ? items[prev].key : null;
    videos.current.forEach((v, key) => {
      if (key === item.key) return;
      v.muted = true;
      if (key !== fading) v.pause();
    });
    if (!cur) return;
    if (shownIndex.current !== index) {
      shownIndex.current = index;
      if (cur.currentTime > 0.05) cur.currentTime = 0;
    }
    if (!live) {
      cur.pause();
      return;
    }
    start(cur);
  }, [index, prev, live, soundOn, approached, wide, item.key, items, start]);

  useEffect(() => {
    if (!blocked || !live || userMuted.current) return;
    const retry = (e: Event) => {
      // The sound button does this itself (otherwise its own tap would turn the sound on, then off).
      if (e.target instanceof Element && e.target.closest("[data-sound-toggle]")) return;
      setBlocked(false);
      setSound(true);
    };
    const gestures = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    const opts = { once: true, capture: true } as const;
    gestures.forEach((g) => window.addEventListener(g, retry, opts));
    return () => gestures.forEach((g) => window.removeEventListener(g, retry, opts));
  }, [blocked, live]);

  // On phones, the glow: a few times a second the current frame, drawn tiny and stretched.
  useEffect(() => {
    if (!live || wide) return;
    const ctx = glowRef.current?.getContext("2d");
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const v = videos.current.get(items[indexRef.current].key);
      if (!v) return;
      if (!wide && ctx && v.readyState >= 2 && t - last > GLOW.everyMs) {
        last = t;
        ctx.filter = "blur(2px) saturate(1.4)";
        ctx.drawImage(v, -3, -3, GLOW.w + 6, GLOW.h + 6);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, wide, items]);

  // A clip that cannot play is skipped (and the reel stops trying if none can).
  const failures = useRef(0);
  const onError = useCallback(
    (i: number) => {
      if (i !== indexRef.current || failures.current >= n) return;
      failures.current += 1;
      window.setTimeout(() => go(i + 1), 1200);
    },
    [go, n],
  );

  const onTime = (i: number, v: HTMLVideoElement) => {
    if (i !== indexRef.current) return;
    failures.current = 0;
    setSettled(v.currentTime > SETTLE_S);
  };

  const toggleSound = () => {
    userMuted.current = soundOn;
    setBlocked(false);
    setSound(!soundOn);
  };
  const audible = soundOn && !blocked;

  const watch = (youtubeId: string, title: string, label?: string, start?: number) => openTrailer({ youtubeId, title, label, start });

  const roleOf = (i: number): Role | null => (i === index ? "current" : i === prev ? "prev" : i === next ? "next" : null);
  const Z: Record<Role, number> = { next: 0, current: 1, prev: 2 };
  const film = item.film;
  const up = item.up;
  const poster = film ? (POSTERS.get(film.slug) ?? film.image) : null;

  return (
    <section
      ref={sectionRef}
      id="showreel"
      data-header-theme="dark"
      aria-roledescription="carousel"
      aria-label="Showreel"
      className={`relative isolate overflow-hidden bg-[#170d06] text-white md:min-h-[100svh] ${overlap ? "max-md:z-10 max-md:shadow-[0_-28px_60px_-24px_rgba(0,0,0,0.55)]" : ""}`}
    >
      {/* Phones: the glow of the clip fills the section behind its band */}
      <canvas ref={glowRef} width={GLOW.w} height={GLOW.h} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full md:hidden" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(23,13,6,0.55)] md:hidden" />
      {/* Phones: the glow fades into the page below, no edge */}
      {fadeTo && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-20 md:hidden" style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }} />}

      {/* The clips: full screen on wide screens; a 16:9 band at the top on phones */}
      <div className="absolute inset-x-0 aspect-video overflow-hidden md:inset-0 md:aspect-auto" style={wide ? undefined : { top: BAND_TOP }}>
        <div className="absolute inset-0 isolate">
          <Image src={items[0].poster} alt="" fill sizes="100vw" className="object-cover" priority={false} />
          {approached &&
            items.map((it, i) => {
            const role = roleOf(i);
            if (!role) return null;
            return (
              <motion.video
                key={it.key}
                ref={(el: HTMLVideoElement | null) => {
                  if (el) videos.current.set(it.key, el);
                  else videos.current.delete(it.key);
                }}
                className="absolute inset-0 h-full w-full max-w-none object-cover"
                style={{ zIndex: Z[role] }}
                initial={false}
                animate={{ opacity: role === "prev" ? 0 : 1 }}
                transition={{ duration: FADE_S, ease: "easeInOut" }}
                src={uhdScreen && it.uhd && !uhdFailed.has(it.key) ? it.uhd : wide ? it.hd : it.sd}
                poster={it.poster}
                muted
                playsInline
                preload="auto"
                onEnded={() => i === indexRef.current && go(i + 1)}
                onError={() => (uhdScreen && it.uhd && !uhdFailed.has(it.key) ? setUhdFailed((f) => new Set(f).add(it.key)) : onError(i))}
                onTimeUpdate={(e) => onTime(i, e.currentTarget)}
              />
            );
          })}
        </div>
        {/* Wide screens: shade where the words sit, and along the foot */}
        <div aria-hidden="true" className="absolute inset-0 z-10 hidden bg-[linear-gradient(77deg,rgba(23,13,6,0.88)_0%,rgba(23,13,6,0.5)_32%,rgba(23,13,6,0)_62%)] md:block" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 hidden h-[45%] bg-[linear-gradient(to_top,rgba(23,13,6,0.92)_0%,rgba(23,13,6,0.5)_40%,rgba(23,13,6,0)_100%)] md:block" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 hidden h-32 bg-gradient-to-b from-[rgba(23,13,6,0.55)] to-transparent md:block" />
      </div>

      {/* Previous and next: on the clip itself (on phones, on its band) */}
      <div
        className="pointer-events-none absolute inset-x-0 z-30 flex items-center justify-between px-3 sm:px-5 md:top-1/2 md:-translate-y-1/2"
        style={wide ? undefined : { top: `calc(${BAND_TOP}px + 28.125vw - 1.125rem)` }}
      >
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={`Previous: ${items[(index - 1 + n) % n].title}`}
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 transition hover:bg-black/65 hover:ring-white/60 md:h-14 md:w-14"
        >
          <ArrowIcon back />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={`Next: ${items[next].title}`}
          className="group pointer-events-auto flex items-center gap-3"
        >
          <span className="hidden max-w-[16rem] translate-x-2 truncate rounded-full bg-black/55 px-4 py-2 text-[0.72rem] font-semibold tracking-[0.12em] text-white uppercase opacity-0 ring-1 ring-white/15 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block">
            Next · {items[next].title}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/25 transition group-hover:bg-black/65 group-hover:ring-white/60 md:h-14 md:w-14">
            <ArrowIcon />
          </span>
        </button>
      </div>

      {/* Sound on or off (it shows "Tap for sound" while the browser is holding the sound back) */}
      <button
        type="button"
        onClick={toggleSound}
        data-sound-toggle
        aria-label={audible ? "Turn the sound off" : "Turn the sound on"}
        aria-pressed={audible}
        className="absolute right-3 z-30 flex items-center gap-2 rounded-full bg-black/40 py-2 pr-2 pl-2 text-white ring-1 ring-white/25 transition hover:bg-black/65 hover:ring-white/60 sm:right-5 md:top-[calc(50%+3.75rem)] md:right-5"
        style={wide ? undefined : { top: `calc(${BAND_TOP}px + 56.25vw - 3.25rem)` }}
      >
        {blocked && <span className="pl-2 text-[max(0.66rem,9px)] font-bold tracking-[0.16em] uppercase">Tap for sound</span>}
        <span className="grid h-8 w-8 place-items-center md:h-10 md:w-10">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
            {audible ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
          </svg>
        </span>
      </button>

      {!wide && (
        <PhoneDetails
          items={items}
          index={index}
          onPlay={() => (up ? watch(up.youtubeId, up.title, up.label) : film?.trailer && watch(film.trailer, film.title))}
        />
      )}

      {/* The words over the clip */}
      <div
        className={`shell relative z-20 flex flex-col pb-10 md:min-h-[100svh] md:justify-end md:pt-28 md:pb-20 ${wide ? "" : "hidden"}`}
        style={wide ? undefined : { paddingTop: `calc(${BAND_TOP}px + 56.25vw + 1.5rem)` }}
      >
        <div className="flex items-end justify-between gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.key}
              className="min-w-0 flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: "easeIn" } }}
            >
              {up ? (
                <UpcomingBillboard up={up} settled={settled} onPlay={() => watch(up.youtubeId, up.title, up.label)} />
              ) : film ? (
                <FilmBillboard film={film} settled={settled} onPlay={() => film.trailer && watch(film.trailer, film.title)} />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Wide screens: the film's role and poster in the corner; for a film on the way, its banner and when it is due */}
          <AnimatePresence mode="wait">
            {up && (
              <motion.div
                key={up.slug}
                className="hidden shrink-0 flex-col items-end gap-3 md:flex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              >
                <span className="border-l-[3px] border-[#f2c230] bg-[rgba(51,51,51,0.6)] py-1.5 pr-8 pl-3 text-[0.8rem] font-medium whitespace-nowrap text-white">{up.banner}</span>
                <span className="rounded-[6px] bg-black/45 px-5 py-4 text-right ring-1 ring-white/15">
                  <span className="block text-[max(0.58rem,9px)] font-bold tracking-[0.28em] text-white/55 uppercase">Release</span>
                  <span className="mt-1 block font-title text-[clamp(1.2rem,1.8vw,1.8rem)] leading-tight text-white">{up.when}</span>
                </span>
              </motion.div>
            )}
            {film && poster && (
              <motion.div
                key={film.slug}
                className="hidden shrink-0 items-end gap-5 md:flex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              >
                <span className="mb-1 border-l-[3px] border-white/80 bg-[rgba(51,51,51,0.6)] py-1.5 pr-8 pl-3 text-[0.8rem] font-medium whitespace-nowrap text-white">{film.roleLabel}</span>
                <Image
                  src={poster}
                  alt={`${film.title} poster`}
                  width={600}
                  height={900}
                  sizes="(min-width: 1024px) 16vw, 24vw"
                  className="h-[clamp(200px,30svh,360px)] w-auto rounded-[4px] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/15"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
