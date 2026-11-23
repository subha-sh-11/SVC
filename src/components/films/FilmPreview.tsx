"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Film } from "@/data/types";
import { filmPosters, titleLogos } from "@/data/posters";
import { watchLink } from "@/data/ott";
import { useLenis } from "@/components/providers/SmoothScroll";
import { loadYouTube, YT_ENDED, YT_PLAYING, type YTPlayer } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { logoGlow } from "@/lib/titleLogo";
import { RoleBadge } from "./FilmCard";

const EASE = [0.22, 1, 0.36, 1] as const;
const START = 15; // seconds into the trailer, past the studio cards
const REVEAL_MS = 2500; // YouTube shows its own controls as playback starts; wait them out

/**
 * The trailer inside the preview: it covers the frame (YouTube's chrome cropped away),
 * tries to play with sound (the visitor just clicked), and falls back to muted if the
 * browser says no.
 */
function PreviewTrailer({ videoId, muted, onSound }: { videoId: string; muted: boolean; onSound: (on: boolean) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [shown, setShown] = useState(false);
  const soundCb = useRef(onSound);
  soundCb.current = onSound;

  useEffect(() => {
    let cancelled = false;
    let reveal = 0;
    let check = 0;
    loadYouTube()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const el = document.createElement("div");
        hostRef.current.appendChild(el);
        playerRef.current = new YT.Player(el, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, playsinline: 1, rel: 0, start: START },
          events: {
            onReady: (e) => {
              e.target.unMute();
              e.target.playVideo();
              // Sound not allowed here (some phones): carry on muted.
              check = window.setTimeout(() => {
                try {
                  if (e.target.getPlayerState() !== YT_PLAYING) {
                    e.target.mute();
                    e.target.playVideo();
                    soundCb.current(false);
                  }
                } catch {
                  /* closed */
                }
              }, 1800);
            },
            onStateChange: (e) => {
              if (e.data === YT_PLAYING && !reveal) reveal = window.setTimeout(() => setShown(true), REVEAL_MS);
              if (e.data === YT_ENDED) {
                e.target.seekTo(START, true);
                e.target.playVideo();
              }
            },
            onError: () => setShown(false),
          },
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      window.clearTimeout(reveal);
      window.clearTimeout(check);
      try {
        playerRef.current?.destroy();
      } catch {
        /* gone */
      }
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    try {
      if (muted) playerRef.current?.mute();
      else playerRef.current?.unMute();
    } catch {
      /* not ready */
    }
  }, [muted]);

  return (
    <motion.div
      aria-hidden="true"
      className="yt-cover pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div ref={hostRef} className="absolute inset-0" />
    </motion.div>
  );
}

function Speaker({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
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

/** A Netflix-style preview of a film: the trailer plays, with Play taking you to where it streams. */
export function FilmPreview({ film, onClose }: { film: Film; onClose: () => void }) {
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const logo = titleLogos[film.slug];
  const poster = filmPosters[film.slug];
  const watch = watchLink(film);
  const still = film.image ?? poster?.lg ?? null;
  const titleId = `preview-${film.slug}`;

  useEffect(() => setMounted(true), []);

  // Hold the page still, close on Escape, and keep Tab inside the dialog.
  useEffect(() => {
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [lenis, onClose]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/75 backdrop-blur-[3px]" aria-hidden="true" />

      <div className="relative flex min-h-full items-start justify-center px-3 py-[4vh] sm:px-6">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative w-full max-w-[920px] overflow-hidden rounded-[10px] bg-[#1a0d05] text-ivory shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ------------------------------------------------ The trailer */}
          <div className="relative aspect-video overflow-hidden bg-black [container-type:size]">
            {still ? (
              // Without a trailer on file, the artwork drifts slowly (a Ken Burns move) so the preview stays alive.
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.02, x: "0%" }}
                animate={film.trailer ? { scale: 1.02 } : { scale: 1.14, x: "-3%" }}
                transition={film.trailer ? { duration: 0 } : { duration: 16, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              >
                <Image src={still} alt="" fill sizes="(min-width: 960px) 920px, 100vw" className="object-cover" priority />
              </motion.div>
            ) : null}
            {film.trailer && <PreviewTrailer key={film.trailer} videoId={film.trailer} muted={muted} onSound={(on) => setMuted(!on)} />}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#1a0d05_0%,rgba(26,13,5,0.55)_28%,rgba(26,13,5,0)_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(80deg,rgba(26,13,5,0.6)_0%,rgba(26,13,5,0)_45%)]" />

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#1a0d05]/85 text-ivory ring-1 ring-white/20 transition hover:bg-[#1a0d05] hover:ring-white/50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 sm:px-10 sm:pb-8">
              <div className="min-w-0">
                <h2 id={titleId} className={cn(logo ? "sr-only" : "display text-[clamp(1.6rem,4.4vw,3.2rem)] leading-[1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]")}>
                  {film.title}
                </h2>
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element -- official title logo, sized by height
                  <img src={logo} alt="" className={cn("h-[clamp(56px,17cqh,140px)] w-auto max-w-[min(100%,460px)] object-contain object-left", logoGlow(film.slug))} />
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
                  <a
                    href={watch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${watch.label}: ${film.title} (opens in a new tab)`}
                    className="inline-flex items-center gap-2.5 rounded-[4px] bg-white px-5 py-2 text-[0.95rem] font-semibold text-black transition-colors hover:bg-white/80 sm:px-6 sm:py-2.5 sm:text-[1.05rem]"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                    {watch.platform ? "Play" : "Where to watch"}
                  </a>
                  <Link
                    href={`/films/${film.slug}`}
                    className="inline-flex items-center gap-2 rounded-[4px] bg-white/20 px-4 py-2 text-[0.9rem] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30 sm:px-5 sm:py-2.5 sm:text-[1rem]"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M12 11v6M12 7.5v.5" strokeLinecap="round" />
                    </svg>
                    More info
                  </Link>
                </div>
              </div>
              {film.trailer && (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-pressed={!muted}
                  aria-label={muted ? "Turn trailer sound on" : "Mute trailer"}
                  className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white/60 text-white transition hover:border-white hover:bg-white/10"
                >
                  <Speaker on={!muted} />
                </button>
              )}
            </div>
          </div>

          {/* ------------------------------------------------ About the film */}
          <div className="grid gap-8 px-5 pt-3 pb-9 sm:px-10 sm:pb-11 md:grid-cols-[1.55fr_1fr] md:gap-10">
            <div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.85rem] font-semibold text-ivory/70">
                <span className="text-marigold">{film.year}</span>
                <span>{film.language}</span>
                {film.genre && <span className="rounded-[3px] border border-white/30 px-1.5 py-px text-[0.72rem]">{film.genre}</span>}
                <RoleBadge film={film} />
              </p>
              {film.premise && <p className="mt-5 text-[1rem] leading-relaxed text-ivory/90 sm:text-[1.08rem]">{film.premise}</p>}
            </div>
            <dl className="space-y-3 text-[0.85rem] leading-snug">
              {film.cast.length > 0 && (
                <div>
                  <dt className="inline text-ivory/50">Cast: </dt>
                  <dd className="inline text-ivory/90">{film.cast.slice(0, 5).join(", ")}</dd>
                </div>
              )}
              {film.director && (
                <div>
                  <dt className="inline text-ivory/50">Director: </dt>
                  <dd className="inline text-ivory/90">{film.director}</dd>
                </div>
              )}
              {film.music && (
                <div>
                  <dt className="inline text-ivory/50">Music: </dt>
                  <dd className="inline text-ivory/90">{film.music}</dd>
                </div>
              )}
              <div>
                <dt className="inline text-ivory/50">Streaming: </dt>
                <dd className="inline">
                  <a href={watch.href} target="_blank" rel="noopener noreferrer" className="text-marigold underline-offset-4 hover:underline">
                    {watch.platform ?? "Find where it streams (JustWatch)"}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}
