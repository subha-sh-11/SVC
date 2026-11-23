"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntroDone } from "@/components/providers/IntroProvider";
import { useTrailer } from "@/components/providers/TrailerProvider";
import { PlayIcon } from "@/components/ui/Buttons";
import { trailerFrames } from "@/data/frames";
import { posterWall, titleLogos } from "@/data/posters";
import type { Film } from "@/data/types";
import { cn } from "@/lib/utils";
import {
  loadYouTube,
  YT_ENDED,
  YT_PAUSED,
  YT_PLAYING,
  type YTPlayer,
} from "@/lib/youtube";

const SLIDE_MS = 16000; // time on each film
const PRELOAD_MS = 8000; // the next film's trailer starts this long before the switch, hidden underneath
const FADE_MS = 1200; // crossfade between films
const SETTLE_MS = 7000; // once the trailer has played this long, the billboard settles (Netflix-style)
const REVEAL_MS = 3000; // YouTube flashes its own icons and a "More videos" bar as playback starts; wait them out
const VIDEO_START = 18; // seconds into the trailer (past the studio cards and title graphics)
const LOOP_TAIL = 6; // loop this many seconds before the end, so YouTube's end screen never shows
const EASE = [0.22, 1, 0.36, 1] as const;
const POSTERS = new Map(
  posterWall.filter((t) => t.official).map((t) => [t.slug, t.lg]),
);
/** A clean still from the trailer (no promo text), falling back to the film's artwork. */
const still = (f: Film) => trailerFrames[f.slug]?.src ?? f.image!;

export type TrailerEvents = {
  onPlayer: (slug: string, p: YTPlayer | null) => void;
  onReady: (slug: string, ready: boolean) => void;
  onSoundBlocked: () => void;
};

/**
 * A trailer, muted and looping, covering its layer. The iframe is sized to cover
 * with CSS container units and scaled up so YouTube's own title bar and buttons
 * sit outside the frame. It fades in once it is actually playing, and it never
 * stays paused: it loops before the end card and restarts if anything stops it.
 */
export function BackgroundTrailer({
  slug,
  videoId,
  audible,
  events,
  start = VIDEO_START,
  end,
}: {
  slug: string;
  videoId: string;
  audible: boolean;
  events: TrailerEvents;
  /** Seconds into the video to start (and loop back to). */
  start?: number;
  /** Loop back to `start` here (a segment), rather than just before the end. */
  end?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [shown, setShown] = useState(false);
  const live = useRef({ audible, events });
  live.current = { audible, events };

  useEffect(() => {
    let cancelled = false;
    let revealTimer = 0;
    let loopTimer = 0;
    let retryTimer = 0;
    loadYouTube()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const el = document.createElement("div");
        hostRef.current.appendChild(el);
        playerRef.current = new YT.Player(el, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
            start,
          },
          events: {
            onReady: (e) => {
              const p = e.target;
              if (live.current.audible) p.unMute();
              else p.mute();
              p.playVideo();
              live.current.events.onPlayer(slug, p);
              loopTimer = window.setInterval(() => {
                try {
                  const d = p.getDuration();
                  const t = p.getCurrentTime();
                  if (end ? t > end || t < start - 1 : d > start + 20 && t > d - LOOP_TAIL)
                    p.seekTo(start, true);
                } catch {
                  /* player gone */
                }
              }, 500);
            },
            onStateChange: (e) => {
              const p = e.target;
              if (e.data === YT_PLAYING) {
                window.clearTimeout(retryTimer);
                if (!revealTimer) {
                  revealTimer = window.setTimeout(() => {
                    setShown(true);
                    live.current.events.onReady(slug, true);
                  }, REVEAL_MS);
                }
              } else if (e.data === YT_ENDED) {
                p.seekTo(start, true);
                p.playVideo();
              } else if (e.data === YT_PAUSED) {
                // Nothing on the page pauses it, so restart. If the browser refuses (sound
                // without a recent tap), carry on muted rather than stop.
                window.clearTimeout(retryTimer);
                p.playVideo();
                retryTimer = window.setTimeout(() => {
                  try {
                    if (p.getPlayerState() !== YT_PLAYING) {
                      p.mute();
                      p.playVideo();
                      live.current.events.onSoundBlocked();
                    }
                  } catch {
                    /* player gone */
                  }
                }, 1500);
              }
            },
            onError: () => setShown(false), // keep showing the artwork
          },
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.clearInterval(loopTimer);
      window.clearTimeout(retryTimer);
      live.current.events.onPlayer(slug, null);
      live.current.events.onReady(slug, false);
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
    };
  }, [slug, videoId, start, end]);

  // Only the film on screen is ever heard.
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      if (audible) p.unMute();
      else p.mute();
    } catch {
      /* not ready yet */
    }
  }, [audible]);

  return (
    <motion.div
      aria-hidden="true"
      className="yt-cover pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div ref={hostRef} className="absolute inset-0" />
    </motion.div>
  );
}

export function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      ) : (
        <path d="M17 9l5 6M22 9l-5 6" />
      )}
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v6M12 7.5v.5" strokeLinecap="round" />
    </svg>
  );
}

type Role = "current" | "next" | "prev";

export function FeaturedFilms({ slides }: { slides: Film[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const introDone = useIntroDone();
  const inView = useInView(sectionRef, { amount: 0.35 });
  const onScreen = useInView(sectionRef);
  // Within a screen of the viewport: trailers load as you approach the section.
  const near = useInView(sectionRef, { margin: "100% 0px 100% 0px" });
  const [approached, setApproached] = useState(false);
  useEffect(() => {
    if (near) setApproached(true);
  }, [near]);
  const openTrailer = useTrailer();
  // The film on screen, the one fading out, and the one whose trailer is rolling underneath, ready to cut to.
  const [{ index, prev, next }, setSlide] = useState<{
    index: number;
    prev: number | null;
    next: number | null;
  }>({ index: 0, prev: null, next: null });
  const [hovering, setHovering] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const players = useRef(new Map<string, YTPlayer>());

  const film = slides[index];
  const poster = POSTERS.get(film.slug);
  const logo = titleLogos[film.slug];
  const live = introDone && inView;
  // The first trailer starts underneath the opening's final moments, so it is already playing when you scroll down.
  const [earlyStart, setEarlyStart] = useState(false);
  const videoOn = videoAllowed && (introDone || earlyStart) && approached;
  const currentReady = Boolean(ready[film.slug]);

  // Video only when it is welcome: not for reduced motion or data-saver.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    setVideoAllowed(!reduced && !saveData);
  }, []);
  // Fetch YouTube's player script during the opening, then start the first trailer once the
  // opening's poster animation is over (it plays on under the name, out of sight).
  useEffect(() => {
    if (!videoAllowed) return;
    const fetchApi = window.setTimeout(
      () => loadYouTube().catch(() => undefined),
      2500,
    );
    const start = window.setTimeout(() => setEarlyStart(true), 6000);
    return () => {
      window.clearTimeout(fetchApi);
      window.clearTimeout(start);
    };
  }, [videoAllowed]);

  // Each film starts unsettled (full synopsis), then settles once its trailer has been on screen a while.
  useEffect(() => {
    setSettled(false);
    if (!currentReady) return;
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [film.slug, currentReady]);

  const go = useCallback(
    (i: number) =>
      setSlide((s) => {
        const n = (i + slides.length) % slides.length;
        return n === s.index ? s : { index: n, prev: s.index, next: null };
      }),
    [slides.length],
  );
  const preload = useCallback(
    (i: number) =>
      setSlide((s) => (i === s.index || i === s.next ? s : { ...s, next: i })),
    [],
  );

  // Rotate, starting the next trailer underneath a few seconds early so the cut is video to video.
  useEffect(() => {
    if (!live || hovering) return;
    const pre = window.setTimeout(
      () => preload((index + 1) % slides.length),
      SLIDE_MS - PRELOAD_MS,
    );
    const t = window.setTimeout(() => go(index + 1), SLIDE_MS);
    return () => {
      window.clearTimeout(pre);
      window.clearTimeout(t);
    };
  }, [index, live, hovering, go, preload, slides.length]);

  // The outgoing film is removed once it has faded away.
  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(
      () => setSlide((s) => ({ ...s, prev: null })),
      FADE_MS + 150,
    );
    return () => window.clearTimeout(t);
  }, [prev, index]);

  const events = useMemo<TrailerEvents>(
    () => ({
      onPlayer: (slug, p) => {
        if (p) players.current.set(slug, p);
        else players.current.delete(slug);
      },
      onReady: (slug, r) =>
        setReady((m) => (Boolean(m[slug]) === r ? m : { ...m, [slug]: r })),
      onSoundBlocked: () => setSoundOn(false),
    }),
    [],
  );

  // Sound follows you: it switches off when the section leaves the screen.
  useEffect(() => {
    if (!onScreen) setSoundOn(false);
  }, [onScreen]);

  const toggleSound = () => {
    const on = !soundOn;
    setSoundOn(on);
    try {
      // Straight from the tap, so the browser allows sound.
      const p = players.current.get(film.slug);
      if (on) p?.unMute();
      else p?.mute();
    } catch {
      /* not ready */
    }
  };

  // Background layers, keyed by film so a pre-rolled trailer carries on playing when it becomes the current one.
  const layers: Array<{ i: number; role: Role }> = [];
  if (next !== null && next !== index && next !== prev)
    layers.push({ i: next, role: "next" });
  layers.push({ i: index, role: "current" });
  if (prev !== null && prev !== index) layers.push({ i: prev, role: "prev" });
  const Z: Record<Role, number> = { next: 0, current: 1, prev: 2 };

  const soundButton = (className: string) =>
    videoAllowed && film.trailer ? (
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={
          soundOn
            ? "Mute the background trailer"
            : "Play the background trailer with sound"
        }
        className={cn(
          "grid place-items-center rounded-full border-2 border-white/70 text-white transition-colors hover:border-white hover:bg-white/10",
          className,
        )}
      >
        <SpeakerIcon on={soundOn} />
      </button>
    ) : null;

  return (
    <section
      ref={sectionRef}
      id="featured"
      data-header-theme="dark"
      aria-roledescription="carousel"
      aria-label="Now featuring"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#170d06] text-white"
    >
      {/* ------------------------------------------------ Background: artwork, then the trailer */}
      <div className="absolute inset-0 -z-10">
        {/* Own stacking context, so the layers' order stays beneath the vignette */}
        <div className="absolute inset-0 isolate">
          {layers.map(({ i, role }) => {
            const s = slides[i];
            return (
              <motion.div
                key={s.slug}
                data-film={s.slug}
                data-role={role}
                className="absolute inset-0 [container-type:size]"
                style={{ zIndex: Z[role] }}
                initial={false}
                animate={{ opacity: role === "prev" ? 0 : 1 }}
                transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
              >
                <Image
                  src={still(s)}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                {videoOn && s.trailer && (
                  <BackgroundTrailer
                    slug={s.slug}
                    videoId={s.trailer}
                    audible={soundOn && role === "current"}
                    events={events}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        {/* Netflix-style vignette: dark on the left for the title, and a deep fade at the bottom for the row */}
        <div className="absolute inset-0 bg-[linear-gradient(77deg,rgba(23,13,6,0.88)_0%,rgba(23,13,6,0.5)_32%,rgba(23,13,6,0)_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,#170d06_0%,rgba(23,13,6,0.82)_30%,rgba(23,13,6,0)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[rgba(23,13,6,0.6)] to-transparent" />
      </div>

      {/* ------------------------------------------------ Billboard */}
      <div className="shell relative flex flex-1 flex-col justify-end pt-28">
        <div className="flex items-end justify-between gap-8">
          {/* Title logo, synopsis, actions */}
          <div className="min-w-0 max-w-[min(100%,40rem)]">
            <p className="flex items-center gap-2.5 text-[0.7rem] font-bold tracking-[0.42em] text-white/80 uppercase">
              <span
                aria-hidden="true"
                className="svc-mark svc-mark--bright block aspect-[2003/736] h-[1.05rem]"
              />
              Film
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={film.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <h2
                  className={cn(
                    logo
                      ? "sr-only"
                      : "mt-4 text-[clamp(2.2rem,5.4vw,5rem)] leading-[0.98] font-semibold tracking-[-0.02em]",
                  )}
                >
                  {film.title}
                </h2>
                {logo && (
                  <motion.div
                    className="mt-4 origin-bottom-left"
                    animate={{ scale: settled ? 0.74 : 1 }}
                    transition={{ duration: 1.2, ease: EASE }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- official title logo, sized by height */}
                    <img
                      src={logo}
                      alt=""
                      className="h-[clamp(70px,17vh,190px)] w-auto max-w-full object-contain object-left drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)]"
                    />
                  </motion.div>
                )}

                {/* As on Netflix, the synopsis steps aside once the trailer is under way */}
                <motion.div
                  className="overflow-hidden"
                  initial={false}
                  animate={
                    settled
                      ? { opacity: 0, height: 0, marginTop: 0 }
                      : { opacity: 1, height: "auto", marginTop: 20 }
                  }
                  transition={{ duration: 1, ease: EASE }}
                >
                  <p className="text-[0.78rem] font-semibold text-white/70">
                    <span className="text-[#46d369]">{film.year}</span>
                    {film.genre && <span> · {film.genre}</span>}
                    {film.director && (
                      <span> · Directed by {film.director}</span>
                    )}
                  </p>
                  {film.premise && (
                    <p className="mt-2.5 line-clamp-3 text-[clamp(0.95rem,1.25vw,1.2rem)] leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                      {film.premise}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {film.trailer && (
                <button
                  type="button"
                  onClick={() => {
                    setSoundOn(false); // the full trailer has the sound now
                    openTrailer({
                      youtubeId: film.trailer!,
                      title: film.title,
                    });
                  }}
                  aria-label={`Play the ${film.title} trailer`}
                  className="inline-flex items-center gap-2.5 rounded-[4px] bg-white px-6 py-2.5 text-[1.05rem] font-semibold text-black transition-colors hover:bg-white/75 sm:px-7 sm:text-lg"
                >
                  <PlayIcon className="h-5 w-5" />
                  Play
                </button>
              )}
              <Link
                href={`/films/${film.slug}`}
                className="inline-flex items-center gap-2.5 rounded-[4px] bg-[rgba(109,109,110,0.7)] px-6 py-2.5 text-[1.05rem] font-semibold text-white transition-colors hover:bg-[rgba(109,109,110,0.45)] sm:px-7 sm:text-lg"
              >
                <InfoIcon />
                More info
              </Link>
            </div>
          </div>

          {/* Right: sound and the role flag (as Netflix places them), the poster in the corner */}
          <div className="hidden shrink-0 items-end gap-5 sm:flex">
            <div className="flex items-center gap-3 pb-1">
              {soundButton("h-11 w-11")}
              <span className="border-l-[3px] border-white/80 bg-[rgba(51,51,51,0.6)] py-1.5 pr-8 pl-3 text-[0.8rem] font-medium whitespace-nowrap text-white">
                {film.roleLabel}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={film.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              >
                <Image
                  src={poster ?? film.image!}
                  alt={`${film.title} poster`}
                  width={600}
                  height={900}
                  sizes="(min-width: 1024px) 16vw, 24vw"
                  className="h-[clamp(200px,32svh,380px)] w-auto rounded-[4px] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/15"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Phones: the sound control top-left and the poster in the top-right corner */}
        {soundButton(
          "absolute top-24 left-[clamp(1rem,4vw,3rem)] h-10 w-10 sm:hidden",
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={film.slug}
            className="absolute top-24 right-[clamp(1rem,4vw,3rem)] sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={poster ?? film.image!}
              alt={`${film.title} poster`}
              width={600}
              height={900}
              sizes="96px"
              className="h-32 w-auto rounded-[3px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/15"
            />
          </motion.div>
        </AnimatePresence>

        {/* ------------------------------------------------ The row: every featured film */}
        <div
          className="mt-10 pb-8 sm:mt-12"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <p className="text-[0.95rem] font-semibold text-white sm:text-[1.15rem]">
            Now featuring
          </p>
          <ol
            aria-label="Featured films"
            className="no-scrollbar -mx-[clamp(1rem,4vw,3rem)] mt-3 flex snap-x scroll-px-[clamp(1rem,4vw,3rem)] gap-2 overflow-x-auto px-[clamp(1rem,4vw,3rem)] pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0"
            style={{
              gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))`,
            }}
          >
            {slides.map((s, i) => {
              const active = i === index;
              return (
                <li
                  key={s.slug}
                  className="w-[44vw] shrink-0 snap-start sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={() => go(i)}
                    // Pointing at a film starts its trailer underneath, so choosing it cuts straight to video.
                    onMouseEnter={() => preload(i)}
                    onFocus={() => preload(i)}
                    aria-label={`Show ${s.title}`}
                    aria-current={active}
                    className={cn(
                      "group relative block aspect-video w-full overflow-hidden rounded-[4px] text-left transition duration-300",
                      active
                        ? "ring-2 ring-white"
                        : "opacity-75 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={still(s)}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 16vw, 44vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    {titleLogos[s.slug] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small title logo on the card
                      <img
                        src={titleLogos[s.slug]}
                        alt=""
                        className="absolute bottom-2 left-2 h-[34%] max-w-[78%] object-contain object-left-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                      />
                    ) : (
                      <span className="absolute bottom-2 left-2 text-xs font-semibold">
                        {s.title}
                      </span>
                    )}
                    {/* Progress, Netflix red */}
                    <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
                      {active && (
                        <motion.span
                          key={`${index}-${live}-${hovering}`}
                          className="absolute inset-0 origin-left bg-gradient-to-r from-[#e8731a] to-[#f2c230]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: live && !hovering ? 1 : 0.02 }}
                          transition={{
                            duration: live && !hovering ? SLIDE_MS / 1000 : 0.3,
                            ease: "linear",
                          }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
