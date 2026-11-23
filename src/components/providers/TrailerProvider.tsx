"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLenis } from "./SmoothScroll";

interface TrailerRequest {
  youtubeId: string;
  title: string;
  label?: string;
  /** Seconds into the video to start from. */
  start?: number;
}

const TrailerContext = createContext<(t: TrailerRequest) => void>(() => {});
const TrailerOpenContext = createContext(false);

export function useTrailer() {
  return useContext(TrailerContext);
}

/** Whether the lightbox is showing a video (so background video can pause meanwhile). */
export function useTrailerOpen() {
  return useContext(TrailerOpenContext);
}

/** One site-wide lightbox that embeds the official uploader's video (no rehosting). */
export function TrailerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<TrailerRequest | null>(null);
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((t: TrailerRequest) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setCurrent(t);
  }, []);
  const close = useCallback(() => setCurrent(null), []);

  useEffect(() => {
    if (!current) {
      lenis?.start();
      returnFocus.current?.focus?.();
      return;
    }
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [current, close, lenis]);

  return (
    <TrailerContext.Provider value={open}>
      <TrailerOpenContext.Provider value={current !== null}>{children}</TrailerOpenContext.Provider>
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title} — ${current.label ?? "Trailer"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button aria-label="Close video" className="absolute inset-0 cursor-zoom-out bg-ink/92 backdrop-blur-md" onClick={close} tabIndex={-1} />
            <motion.div
              className="relative w-full max-w-6xl"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">{current.label ?? "Trailer"}</p>
                  <p className="display mt-2 text-3xl sm:text-4xl">{current.title}</p>
                </div>
                <button
                  ref={closeRef}
                  onClick={close}
                  className="group flex items-center gap-3 rounded-[2px] border border-paper/20 px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase transition hover:border-gold hover:text-gold"
                >
                  Close
                  <span className="relative block h-3 w-3">
                    <span className="absolute top-1/2 left-0 h-px w-3 rotate-45 bg-current" />
                    <span className="absolute top-1/2 left-0 h-px w-3 -rotate-45 bg-current" />
                  </span>
                </button>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-black shadow-[0_40px_120px_-20px_rgba(232,181,58,0.25)] ring-1 ring-gold/30">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0&modestbranding=1${current.start ? `&start=${Math.floor(current.start)}` : ""}`}
                  title={`${current.title} — ${current.label ?? "Trailer"}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-xs text-dim">Video embedded from the official uploader on YouTube.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TrailerContext.Provider>
  );
}
