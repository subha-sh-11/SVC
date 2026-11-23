"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Milestone, MilestoneFilm } from "@/data/types";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ArrowIcon } from "@/components/ui/Buttons";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MilestoneImage } from "./MilestoneArt";

const EASE = [0.22, 1, 0.36, 1] as const;

const dateOf = (m: Milestone) => (/^\d{4}-\d{2}-\d{2}$/.test(m.date) ? formatDate(m.date) : m.date);

/** A link that may lead off the site. */
function Go({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return /^https?:/.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Poster({ f, sizes, className }: { f: MilestoneFilm; sizes: string; className?: string }) {
  return (
    <div className={cn("relative aspect-[2/3] overflow-hidden rounded-[6px] bg-[#1c0d05] shadow-[0_14px_26px_-18px_rgba(59,26,7,0.65)] ring-1 ring-black/[0.06]", className)}>
      {f.poster ? (
        <Image src={f.poster.src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: f.poster.position }} />
      ) : (
        <div className="@container absolute inset-0 grid place-items-center bg-[radial-gradient(120%_80%_at_50%_0%,#8a330e,#1c0d05_78%)] p-[12%] text-center">
          <span className="pointer-events-none absolute inset-[6%] rounded-[3px] border border-[#ffd873]/30" />
          <span className="display text-[16cqw] leading-[1.02] text-ivory">{f.title}</span>
        </div>
      )}
    </div>
  );
}

/** A film the milestone is about: its poster, who made it, who is in it, and its story. */
function FeatureFilm({ f, compact }: { f: MilestoneFilm; compact: boolean }) {
  return (
    <article className={cn("grid gap-5 rounded-2xl bg-[#fbf3e6] p-5 ring-1 ring-[#e8731a]/10", compact ? "grid-cols-[96px_1fr] sm:grid-cols-[112px_1fr]" : "grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] sm:gap-7 sm:p-7")}>
      <Poster f={f} sizes={compact ? "112px" : "160px"} />
      <div className="min-w-0">
        <h4 className={cn("display leading-tight", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>
          {f.title} <span className="font-sans text-[0.5em] font-normal text-dim">{f.year}</span>
        </h4>
        {f.note && <p className="mt-1.5 text-[0.85rem] font-semibold text-saffron-deep">{f.note}</p>}
        {f.cast && f.cast.length > 0 && <p className="mt-1 text-[0.85rem] text-mute">Starring {f.cast.join(", ")}</p>}
        {f.premise && <p className={cn("mt-3 leading-relaxed text-paper/80", compact ? "line-clamp-4 text-[0.88rem]" : "text-[0.95rem] sm:text-[1rem]")}>{f.premise}</p>}
        {f.href && (
          <Go
            href={f.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-saffron-deep px-4 py-2 text-[0.68rem] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-paper"
          >
            {f.href === "/upcoming" ? "Upcoming films" : "View film"} <ArrowIcon />
          </Go>
        )}
      </div>
    </article>
  );
}

/** The other films of those years, as a row of posters. */
function FilmGrid({ films }: { films: MilestoneFilm[] }) {
  return (
    <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
      {films.map((f) => {
        const body = (
          <>
            <Poster f={f} sizes="(min-width: 768px) 150px, 30vw" className="transition-[translate,box-shadow] duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_32px_-18px_rgba(59,26,7,0.7)]" />
            <p className="mt-2.5 truncate font-title text-[0.9rem] leading-tight tracking-[0.01em] text-paper uppercase transition-colors group-hover:text-saffron-deep">{f.title}</p>
            <p className="mt-0.5 truncate text-[0.7rem] text-dim">
              {f.year}
              {f.note && <> · {f.note.replace(/^Directed by /, "")}</>}
            </p>
          </>
        );
        return (
          <li key={`${f.title}-${f.year}`}>
            {f.href ? (
              <Go href={f.href} className="group block">
                {body}
              </Go>
            ) : (
              <div className="group">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A milestone, opened: the picture large, the whole story, a quote, and every film behind it. */
export function MilestoneSheet({ m, onClose }: { m: Milestone; onClose: () => void }) {
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const d = m.detail ?? {};
  const featured = d.featured ?? [];
  const titleId = "milestone-sheet-title";

  useEffect(() => setMounted(true), []);

  // Hold the page still, close on Escape, and keep Tab inside the sheet.
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
      <div className="fixed inset-0 bg-[#1c0d05]/70 backdrop-blur-[3px]" aria-hidden="true" />

      <div className="relative flex min-h-full items-start justify-center px-3 py-[4vh] sm:px-6">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="theme-light type-classic relative w-full max-w-[1040px] overflow-hidden rounded-2xl bg-[#fffdf9] text-paper shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/10"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* The picture, large */}
          <div className="relative">
            <MilestoneImage m={m} sizes="(min-width: 1080px) 1040px, 100vw" className="rounded-none! shadow-none! ring-0! md:aspect-[2.2/1]" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-30 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/90 text-paper shadow-md ring-1 ring-black/10 transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="px-5 pt-8 pb-10 sm:px-12 sm:pt-10 sm:pb-12">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="tabular-nums tracking-[0.06em] text-sm text-saffron-deep">{dateOf(m)}</span>
              {m.type && <span className="text-[0.62rem] font-bold tracking-[0.22em] text-mute uppercase">{m.type}</span>}
            </p>
            <h2 id={titleId} className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">
              {m.title}
            </h2>
            {m.description && <p className="mt-5 max-w-3xl text-[1.02rem] leading-relaxed text-mute sm:text-[1.1rem]">{m.description}</p>}

            {d.quote && (
              <figure className="mt-8 max-w-3xl border-l-2 border-saffron-deep pl-5 sm:pl-7">
                <blockquote className="display text-xl leading-snug italic sm:text-2xl">&ldquo;{d.quote.text}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-dim">{d.quote.by}</figcaption>
              </figure>
            )}

            {featured.length > 0 && (
              <section className="mt-10">
                <h3 className="text-[0.62rem] font-bold tracking-[0.24em] text-dim uppercase">{featured.length === 1 ? "The film" : `The films · ${featured.length}`}</h3>
                <div className={cn("mt-4 grid gap-4", featured.length > 1 && "md:grid-cols-2")}>
                  {featured.map((f) => (
                    <FeatureFilm key={`${f.title}-${f.year}`} f={f} compact={featured.length > 1} />
                  ))}
                </div>
              </section>
            )}

            {d.more && (
              <section className="mt-12">
                <h3 className="flex items-baseline gap-3 text-[0.62rem] font-bold tracking-[0.24em] text-dim uppercase">
                  {d.more.label}
                  <span className="text-saffron-deep">{d.more.films.length}</span>
                </h3>
                <FilmGrid films={d.more.films} />
              </section>
            )}

            {d.links && d.links.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {d.links.map((l) => (
                  <Go
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-5 py-2.5 text-[0.68rem] font-bold tracking-[0.16em] text-paper uppercase transition-colors hover:border-saffron-deep hover:text-saffron-deep"
                  >
                    {l.label} <ArrowIcon />
                  </Go>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}
