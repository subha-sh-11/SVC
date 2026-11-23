"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AwardPhoto } from "@/data/awardPhotos";
import { useLenis } from "@/components/providers/SmoothScroll";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A Pinterest-style wall of award moments: real photographs of SVC people receiving their
 * awards, in a masonry of their natural shapes. Click a photo to see it large.
 */
export function AwardWall({ photos, title, onClose }: { photos: AwardPhoto[]; title: string; onClose: () => void }) {
  const lenis = useLenis();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [group, setGroup] = useState("all");
  const [open, setOpen] = useState<AwardPhoto | null>(null);

  const groups = useMemo(() => [...new Set(photos.map((p) => p.group))], [photos]);
  const shown = group === "all" ? photos : photos.filter((p) => p.group === group);

  useEffect(() => setMounted(true), []);

  // Hold the page still and close on Escape (the large view first, then the wall).
  useEffect(() => {
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) setOpen(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="theme-light fixed inset-0 z-[90] overflow-y-auto overscroll-contain"
      data-lenis-prevent
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="sticky top-0 z-10 border-b border-ink-700/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-paper sm:text-2xl">{title}</h2>
          <div className="no-scrollbar order-3 -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:px-0">
            {["all", ...groups].map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                aria-pressed={group === g}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  group === g ? "bg-paper text-white" : "bg-ink-900 text-paper/80 hover:bg-ink-800",
                )}
              >
                {g === "all" ? "All" : g}
              </button>
            ))}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink-900 text-paper transition hover:bg-ink-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-4 pt-6 pb-20 sm:px-8">
        <div className={cn("gap-4", photos.length > 8 ? "columns-2 sm:columns-3 lg:columns-4 2xl:columns-5" : "columns-1 sm:columns-2 lg:columns-3")}>
          {shown.map((p, i) => (
            <motion.figure
              key={`${group}-${p.src}`}
              className="mb-6 break-inside-avoid"
              initial={{ opacity: 0, y: 34, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: Math.min(i, 14) * 0.05, ease: EASE }}
            >
              <button onClick={() => setOpen(p)} className="group relative block w-full overflow-hidden rounded-2xl bg-ink-900" aria-label={`View: ${p.caption}`}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" aria-hidden="true" />
              </button>
              <figcaption className="px-1 pt-2.5">
                <p className="text-[0.62rem] font-bold tracking-[0.14em] text-gold uppercase">{p.award}</p>
                <p className="mt-1 text-[0.82rem] leading-snug font-medium text-paper">{p.caption}</p>
                <p className="mt-1 text-xs text-dim">
                  {p.film && <>{p.film} · </>}
                  {p.date}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-[0.7rem] leading-relaxed text-dim">
          Photographs: {[...new Set(photos.map((p) => p.credit))].join("; ")}. No endorsement by the photographers or the Government of India is implied.
        </p>
      </div>

      {/* The large view of one photograph. */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/85 p-3 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
          >
            <motion.figure
              className="relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white lg:flex-row"
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative min-h-0 flex-1 bg-black">
                <Image src={open.src} alt={open.alt} width={open.w} height={open.h} sizes="(min-width: 1024px) 70vw, 100vw" className="h-full max-h-[62vh] w-full object-contain lg:max-h-[86vh]" />
              </div>
              <figcaption className="flex shrink-0 flex-col gap-3 p-6 lg:w-[340px] lg:p-8">
                <p className="text-[0.66rem] font-bold tracking-[0.16em] text-gold uppercase">{open.award}</p>
                <p className="text-lg leading-snug font-semibold text-paper">{open.caption}</p>
                <p className="text-sm text-mute">
                  {open.film && <>{open.film} · </>}
                  {open.date}
                </p>
                {open.filmSlug && (
                  <Link href={`/films/${open.filmSlug}`} className="mt-2 self-start rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-bright">
                    About the film
                  </Link>
                )}
                <p className="mt-auto pt-4 text-[0.68rem] leading-relaxed text-dim">Photo: {open.credit}</p>
              </figcaption>
              <button onClick={() => setOpen(null)} aria-label="Close photo" className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-paper shadow">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
