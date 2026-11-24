"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal } from "@/components/ui/motion";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { TeamMember } from "@/data/team";

/** A member of the team with their films (worked out on the server from producer credits). */
export type Profile = TeamMember & { films: { slug: string; title: string; year: number | null; poster: string | null }[] };

const between = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const EASE = [0.22, 1, 0.36, 1] as const;

/** First and latest year of a person's films, e.g. "2003–2025". */
function filmSpan(m: Profile) {
  const years = m.films.map((f) => f.year).filter((y): y is number => Boolean(y));
  if (!years.length) return null;
  const a = Math.min(...years);
  const b = Math.max(...years);
  return a === b ? String(a) : `${a}–${b}`;
}

/**
 * A portrait that says it opens: a small "+" in its corner all the time; under the pointer (or
 * keyboard focus) it lifts with a saffron edge, a warm shade rises, and a glimpse of what is inside
 * comes up: how many films, over which years, three of the latest posters fanned out, and the way in.
 */
function Portrait({ m, sizes, priority = false, hint }: { m: Profile; sizes: string; priority?: boolean; hint?: MotionValue<number> }) {
  const span = filmSpan(m);
  // The latest three with posters, the newest in front.
  const peek = m.films.filter((f) => f.poster).slice(-3).reverse();
  const shown = "opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-visible:opacity-100";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-[#f3e2c6] shadow-[0_28px_60px_-28px_rgba(59,26,7,0.5)] ring-1 ring-black/[0.05] transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_0_0_2px_rgba(232,115,26,0.85),0_40px_70px_-28px_rgba(59,26,7,0.6)] group-focus-visible:shadow-[0_0_0_2px_rgba(232,115,26,0.85),0_40px_70px_-28px_rgba(59,26,7,0.6)]">
      <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes={sizes} priority={priority} className="object-cover object-[50%_25%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />

      {/* A warm shade rising from the foot */}
      <span aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t from-[#2a1408]/90 via-[#2a1408]/25 to-transparent ${shown}`} />

      {/* Always there: a "+" that says there is more (it turns and fills on hover) */}
      <motion.span
        aria-hidden="true"
        style={hint ? { opacity: hint } : undefined}
        className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#2a1408] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-[rotate,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 group-hover:bg-saffron-deep group-hover:text-white"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </motion.span>

      {/* A few of their films, fanned out from the corner */}
      {peek.map((f, k) => (
        <span
          key={f.slug}
          aria-hidden="true"
          className={`absolute bottom-[6%] aspect-[2/3] w-[19%] translate-y-[35%] overflow-hidden rounded-[5px] shadow-[0_12px_22px_-8px_rgba(0,0,0,0.7)] ring-1 ring-white/70 group-hover:translate-y-0 group-focus-visible:translate-y-0 ${shown}`}
          style={{ right: `${5 + k * 9.5}%`, rotate: `${(1 - k) * 7}deg`, zIndex: 3 - k, transitionDelay: `${60 + k * 70}ms` }}
        >
          <Image src={f.poster!} alt="" fill sizes="80px" className="object-cover" />
        </span>
      ))}

      {/* What opens: how much, over which years, and the way in */}
      <span aria-hidden="true" className={`absolute bottom-[6%] left-[6%] translate-y-3 group-hover:translate-y-0 group-focus-visible:translate-y-0 ${shown}`}>
        {m.films.length > 0 && (
          <>
            <span className="block font-title text-[2.1rem] leading-none text-white">{m.films.length}</span>
            <span className="mt-1 block text-[max(0.56rem,9px)] font-bold tracking-[0.2em] whitespace-nowrap text-white/80 uppercase">
              {m.films.length === 1 ? "Film" : "Films"}
              {span && ` · ${span}`}
            </span>
          </>
        )}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[max(0.58rem,9px)] font-bold tracking-[0.16em] whitespace-nowrap text-[#2a1408] uppercase shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]">
          View profile
          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </span>
    </div>
  );
}

function Caption({ m, className }: { m: Profile; className?: string }) {
  return (
    <div className={className}>
      <p className="font-display text-[1.35rem] leading-tight font-medium text-paper transition-colors duration-300 group-hover:text-saffron-deep">{m.name}</p>
      <p className="mt-1 text-[max(0.6rem,9px)] font-bold tracking-[0.2em] text-gold uppercase">{m.role}</p>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-mute">{m.line}</p>
      <p className="mt-2.5 inline-flex items-center gap-1.5 text-[max(0.62rem,9px)] font-bold tracking-[0.18em] text-saffron-deep uppercase">
        View profile <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </p>
    </div>
  );
}

/** Phones: a person's films by decade, each a row of posters to swipe through. */
function FilmRows({ films, onClose }: { films: Profile["films"]; onClose: () => void }) {
  const groups = new Map<string, Profile["films"]>();
  for (const f of films) {
    const k = f.year ? `${Math.floor(f.year / 10) * 10}s` : "Other";
    groups.set(k, [...(groups.get(k) ?? []), f]);
  }
  return (
    <div className="mt-5 space-y-8 sm:hidden">
      {[...groups].map(([k, list]) => {
        const years = list.map((f) => f.year).filter((y): y is number => Boolean(y));
        const a = years.length ? Math.min(...years) : null;
        const b = years.length ? Math.max(...years) : null;
        return (
          <section key={k} aria-label={`Films, ${k}`}>
            <p className="flex items-baseline justify-between gap-3">
              <span className="font-display text-[1.35rem] text-[#2a1408]">{k}</span>
              <span className="text-[0.72rem] text-[#9a7558]">
                {a && (a === b ? a : `${a}–${b}`)} · {list.length} {list.length === 1 ? "film" : "films"}
              </span>
            </p>
            <ul className="no-scrollbar -mx-6 mt-3 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-1">
              {list.map((f) => (
                <li key={f.slug} className="w-[29vw] max-w-[132px] shrink-0 snap-start">
                  <Link href={`/films/${f.slug}`} onClick={onClose} className="block">
                    <span className="relative block aspect-[2/3] overflow-hidden rounded-[8px] bg-[#f1e4cf] shadow-[0_10px_22px_-14px_rgba(59,26,7,0.55)]">
                      {f.poster ? (
                        <Image src={f.poster} alt="" fill sizes="30vw" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center p-2 text-center font-display text-sm text-[#6f4b2f]">{f.title}</span>
                      )}
                    </span>
                    <span className="mt-1.5 block truncate text-[0.74rem] font-semibold text-[#2a1408]">{f.title}</span>
                    {f.year && <span className="block text-[max(0.62rem,9px)] text-[#9a7558]">{f.year}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** A person's profile: their portrait and story, and the films they produced. */
function ProfileSheet({ m, onClose }: { m: Profile; onClose: () => void }) {
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const span = filmSpan(m);

  useEffect(() => {
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis, onClose]);

  return createPortal(
    <motion.div
      className="theme-light fixed inset-0 z-[90] overflow-y-auto overscroll-contain"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-[#2a1408]/55 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative flex min-h-full items-start justify-center sm:px-6 sm:py-[5vh]">
        <motion.article
          role="dialog"
          aria-modal="true"
          aria-label={`${m.name}, ${m.role}`}
          className="relative w-full max-w-5xl overflow-hidden bg-[#fffaf3] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] max-sm:min-h-[100svh] max-sm:overflow-visible sm:rounded-[22px]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.55, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* On phones the close button stays in reach while the profile scrolls */}
          <div className="sticky top-0 z-20 h-0 sm:contents">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#2a1408] shadow transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="relative aspect-square sm:aspect-[4/5] md:aspect-auto md:min-h-[520px]">
              <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[50%_22%]" priority />
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent sm:h-1/3 sm:from-black/40 sm:via-transparent md:hidden" aria-hidden="true" />
              {/* Phones: the name sits on the portrait */}
              <div className="absolute inset-x-6 bottom-6 sm:hidden">
                <p className="text-[max(0.62rem,9px)] font-bold tracking-[0.24em] text-[#f2c230] uppercase">{m.role}</p>
                <p className="mt-2 font-display text-[2.6rem] leading-none text-white">{m.name}</p>
              </div>
            </div>
            <div className="p-6 sm:p-10">
              <p className="eyebrow flex items-center gap-3 max-sm:hidden">
                {m.role}
              </p>
              <h3 className="mt-4 font-display text-5xl leading-none font-medium text-[#2a1408] max-sm:sr-only sm:text-6xl">{m.name}</h3>
              <div className="mt-6 flex gap-8 border-y border-[#e8731a]/15 py-4 max-sm:mt-0">
                <div>
                  <p className="font-display text-3xl text-[#c2520e]">{m.films.length}</p>
                  <p className="mt-1 text-[max(0.6rem,9px)] font-bold tracking-[0.18em] text-[#9a7558] uppercase">Films produced</p>
                </div>
                {span && (
                  <div>
                    <p className="font-display text-3xl text-[#c2520e]">{span}</p>
                    <p className="mt-1 text-[max(0.6rem,9px)] font-bold tracking-[0.18em] text-[#9a7558] uppercase">First to latest film</p>
                  </div>
                )}
              </div>
              <p className="mt-6 text-[0.98rem] leading-relaxed text-[#4a2712]">{m.bio}</p>
              {m.note && <p className="mt-3 text-sm leading-relaxed text-[#6f4b2f]">{m.note}</p>}
              <p className="mt-6 text-[max(0.6rem,9px)] text-[#9a7558]">{m.credit}</p>
            </div>
          </div>

          {m.films.length > 0 && (
            <div className="border-t border-[#e8731a]/15 p-6 pb-10 sm:p-10">
              <p className="text-[max(0.66rem,9px)] font-bold tracking-[0.24em] text-[#c2520e] uppercase">Films</p>
              <FilmRows films={m.films} onClose={onClose} />
              <ul className="mt-5 grid grid-cols-3 gap-3 max-sm:hidden sm:grid-cols-5 lg:grid-cols-6">
                {m.films.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/films/${f.slug}`} onClick={onClose} className="group block">
                      <span className="relative block aspect-[2/3] overflow-hidden rounded-[8px] bg-[#f1e4cf] shadow-[0_10px_24px_-14px_rgba(59,26,7,0.5)]">
                        {f.poster ? (
                          <Image src={f.poster} alt="" fill sizes="(min-width: 1024px) 140px, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center p-2 text-center font-display text-sm text-[#6f4b2f]">{f.title}</span>
                        )}
                      </span>
                      <span className="mt-1.5 block truncate text-[0.72rem] font-semibold text-[#2a1408] group-hover:text-[#c2520e]">{f.title}</span>
                      {f.year && <span className="block text-[max(0.62rem,9px)] text-[#9a7558]">{f.year}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.article>
      </div>
    </motion.div>,
    document.body,
  );
}

/** Phones: the four as small portraits, two side by side, each with its name on it. Tapping one opens the profile. */
function PhonePillars({ members, onOpen }: { members: Profile[]; onOpen: (m: Profile) => void }) {
  return (
    <ul className="mt-7 grid grid-cols-2 gap-3 sm:hidden">
      {members.map((m, i) => (
        <Reveal as="li" key={m.name} delay={(i % 2) * 0.06}>
          <button
            type="button"
            onClick={() => onOpen(m)}
            aria-label={`${m.name}: view profile`}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#f3e2c6] text-left shadow-[0_18px_34px_-22px_rgba(59,26,7,0.6)]"
          >
            <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="46vw" className="object-cover object-[50%_22%]" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#1c0d05]/90 via-[#1c0d05]/45 to-transparent" />
            <span aria-hidden="true" className="absolute top-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#2a1408] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.45)]">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </span>
            <span className="absolute inset-x-3 bottom-3">
              <span className="block font-display text-[1.15rem] leading-tight text-white">{m.name}</span>
              <span className="mt-1 line-clamp-2 block text-[max(0.55rem,9px)] leading-snug font-bold tracking-[0.12em] text-[#f2c230] uppercase">{m.role}</span>
            </span>
          </button>
        </Reveal>
      ))}
    </ul>
  );
}

type Layout = { w: number; h: number; wide: boolean; cardW: number; cardH: number; gap: number; rowX: number; rowY: number; bigW: number; bigH: number; bigX: number; bigY: number };

function layout(w: number, h: number, n: number): Layout {
  const wide = w >= 1024;
  const cw = Math.min(w - 2 * Math.max(48, 0.05 * w), 1440);
  const gap = Math.max(20, 0.018 * w);
  const cardW = Math.min((cw - (n - 1) * gap) / n, 0.32 * h);
  const cardH = 1.25 * cardW;
  const rowW = n * cardW + (n - 1) * gap;
  const bigH = Math.min(0.66 * h, 760);
  const bigW = 0.8 * bigH;
  return { w, h, wide, cardW, cardH, gap, rowX: (w - rowW) / 2, rowY: 0.5 * h - cardH / 2 - 10, bigW, bigH, bigX: (w - cw) / 2 + 0.08 * cw, bigY: (h - bigH) / 2 };
}

function useLayout(n: number) {
  const [l, setL] = useState(() => layout(1440, 900, n));
  useEffect(() => {
    const measure = () => setL(layout(document.documentElement.clientWidth, window.innerHeight, n));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n]);
  return l;
}

/** One card in the row. The first (Dil Raju) flies in from his large portrait; the rest join him. */
function Card({ m, i, p, l, onOpen }: { m: Profile; i: number; p: MotionValue<number>; l: Layout; onOpen: () => void }) {
  const x = l.rowX + i * (l.cardW + l.gap);
  const move = (v: number) => easeInOut(between(v, 0.14, 0.46));
  const join = (v: number) => easeInOut(between(v, 0.3 + 0.06 * (i - 1), 0.52 + 0.06 * (i - 1)));
  const s0 = l.bigW / l.cardW;
  const dx0 = l.bigX + l.bigW / 2 - (x + l.cardW / 2);
  const dy0 = l.bigY + l.bigH / 2 - (l.rowY + l.cardH / 2);
  const scale = useTransform(p, (v) => (i === 0 ? lerp(s0, 1, move(v)) : 1));
  const tx = useTransform(p, (v) => (i === 0 ? lerp(dx0, 0, move(v)) : lerp(90, 0, join(v))));
  const ty = useTransform(p, (v) => (i === 0 ? lerp(dy0, 0, move(v)) : lerp(40, 0, join(v))));
  const opacity = useTransform(p, (v) => (i === 0 ? 1 : join(v)));
  const capOpacity = useTransform(p, (v) => between(v, 0.58 + 0.04 * i, 0.7 + 0.04 * i));
  const capY = useTransform(p, (v) => 12 * (1 - between(v, 0.58 + 0.04 * i, 0.7 + 0.04 * i)));
  const events = useTransform(p, (v) => (v > 0.5 ? "auto" : "none"));
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`${m.name}: view profile`}
      className="group absolute block cursor-pointer text-left outline-none"
      style={{ left: x, top: l.rowY, width: l.cardW, pointerEvents: events, zIndex: i === 0 ? 2 : 1 }}
    >
      <motion.span className="block" style={{ height: l.cardH, scale, x: tx, y: ty, opacity }}>
        {/* The "+" comes in with the row, not on the large opening portrait */}
        <Portrait m={m} sizes={i === 0 ? "(min-width: 1024px) 40vw, 100vw" : "20vw"} hint={capOpacity} />
      </motion.span>
      <motion.span className="block pt-[18px]" style={{ opacity: capOpacity, y: capY }}>
        <Caption m={m} />
      </motion.span>
    </motion.button>
  );
}

/**
 * The pillars of SVC. Pinned on wide screens: Dil Raju first, large, with his name; as you
 * scroll his portrait takes its place in a row and the others who built the banner join him.
 * Each opens their profile.
 */
export function Backbones({ members }: { members: Profile[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const l = useLayout(members.length);
  const [open, setOpen] = useState<Profile | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const introOpacity = useTransform(p, (v) => 1 - between(v, 0.12, 0.26));
  const introX = useTransform(p, (v) => -30 * between(v, 0.12, 0.26));
  const headOpacity = useTransform(p, (v) => between(v, 0.44, 0.58));
  const headY = useTransform(p, (v) => 18 * (1 - between(v, 0.44, 0.58)));
  const lead = members[0];
  useEffect(() => {
    const el = ref.current;
    if (!el || l.wide) return;
    const phone = window.matchMedia("(max-width: 767px)");
    // Pinned so that the section sliding over it (the reel, next) has covered the screen by the
    // time it reaches the top: when the reel is shorter than this section, it pins a little later,
    // once its heading has gone by.
    const over = el.nextElementSibling as HTMLElement | null;
    const set = () => {
      const h = el.offsetHeight;
      el.style.top = phone.matches ? `${Math.min(0, window.innerHeight - h, (over?.offsetHeight ?? h) - h)}px` : "";
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    if (over) ro.observe(over);
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, [l.wide]);

  const heading = (
    <>
      <p className="eyebrow flex items-center justify-center gap-3">
        The people behind the banner
      </p>
      <h2 className="mt-4 text-center font-display text-4xl font-medium text-paper sm:text-5xl">
        The pillars of <span className="italic text-gold-gradient">SVC</span>
      </h2>
    </>
  );
  const credits = members.map((m) => `${m.name}: ${m.credit}`).join(" · ");
  const sheet = <AnimatePresence>{open && <ProfileSheet key={open.name} m={open} onClose={close} />}</AnimatePresence>;

  // Phones, small windows and reduced motion: the same people, simply laid out.
  if (!l.wide || reduce) {
    return (
      <section ref={ref} className="shell py-16 max-md:sticky max-md:top-0 max-md:bg-[#fffdf9] max-md:pt-16 max-md:pb-10 sm:py-24">
        <Reveal>{heading}</Reveal>
        <PhonePillars members={members} onOpen={setOpen} />
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 max-sm:hidden sm:grid-cols-4">
          {members.map((m, i) => (
            <Reveal key={m.name} delay={(i % 2) * 0.08}>
              <button type="button" onClick={() => setOpen(m)} className="group block w-full cursor-pointer text-left outline-none" aria-label={`${m.name}: view profile`}>
                <span className="relative block aspect-[4/5]">
                  <Portrait m={m} sizes="50vw" />
                </span>
                <Caption m={m} className="mt-4" />
              </button>
            </Reveal>
          ))}
        </div>
        {/* Phones: each photo is credited in its profile instead */}
        <p className="mt-10 text-[max(0.65rem,9px)] leading-relaxed text-dim max-sm:hidden">{credits}</p>
        {sheet}
      </section>
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="relative h-[300svh]">
      <div className="sticky top-0 h-[100svh] min-h-[680px] overflow-hidden bg-[#faf1e4]">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(rgba(194,82,14,0.12)_1.2px,transparent_1.6px)] [background-size:26px_26px]" />

        {/* Him first: the large portrait's words */}
        <motion.div className="absolute" style={{ left: l.bigX + l.bigW + 0.06 * l.w, top: "50%", translate: "0 -50%", width: Math.min(0.4 * l.w, 620), opacity: introOpacity, x: introX }}>
          <p className="eyebrow flex items-center gap-3">
            The people behind the banner
          </p>
          <p className="mt-6 font-display text-[clamp(3.2rem,6vw,6.4rem)] leading-[0.95] font-medium text-paper">{lead.name}</p>
          <p className="mt-4 text-[0.72rem] font-bold tracking-[0.24em] text-gold uppercase">{lead.role}</p>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-mute">{lead.line}</p>
        </motion.div>

        {/* Then all of them */}
        <motion.div className="pointer-events-none absolute inset-x-0" style={{ top: Math.max(56, l.rowY - 150), opacity: headOpacity, y: headY }}>
          {heading}
        </motion.div>
        {members.map((m, i) => (
          <Card key={m.name} m={m} i={i} p={p} l={l} onOpen={() => setOpen(m)} />
        ))}
        <motion.p className="absolute inset-x-0 bottom-5 text-center text-[max(0.62rem,9px)] text-dim" style={{ opacity: headOpacity }}>
          {credits}
        </motion.p>
      </div>
      {sheet}
    </div>
  );
}
