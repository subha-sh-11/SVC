"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Film, FilmCategory } from "@/data/types";
import { standing } from "@/data/standing";
import { upcoming } from "@/data/upcoming";
import { filmPosters } from "@/data/posters";
import { cn } from "@/lib/utils";
import { PIN_SHAPES, PinBoard, twoColumns } from "@/components/ui/Pins";
import { ComingSoonTile, FilmTile, hasLandscapePoster, type TileSize } from "./FilmTile";
import { FilmPreview } from "./FilmPreview";

type Cat = "all" | FilmCategory;

const CATS: { key: Cat; label: string }[] = [
  { key: "all", label: "All" },
  { key: "core", label: "SVC Productions" },
  { key: "presentation", label: "Presentations" },
  { key: "related", label: "Dil Raju Productions" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2027-03-05" → "5 Mar 2027"; "December 2026 reported; no locked day" → "Dec 2026"; "Eid 2027 announced window" → "Eid 2027". */
function shortRelease(r: string | null) {
  if (!r) return null;
  const iso = r.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${Number(iso[3])} ${MONTHS[Number(iso[2]) - 1]} ${iso[1]}`;
  const text = r.split(";")[0].replace(/\b(reported|announced window|announced)\b/gi, "").trim();
  return text.replace(/^(January|February|March|April|May|June|July|August|September|October|November|December)\b/, (m) => m.slice(0, 3));
}
/** Announced SVC projects for the closing tile (the same picks as the home page), soonest first. */
const NEXT_UP = ["svc64", "markandeya", "yellamma", "svc63", "rowdy-janardhana"]
  .map((s) => upcoming.find((u) => u.slug === s))
  .filter((u): u is NonNullable<typeof u> => Boolean(u))
  .map((u) => ({ title: u.title, release: shortRelease(u.release) }));

/** One row height for every film, so the shelf stays even and compact: a hit with a landscape
 * poster spans two columns (same height); everything else is a regular poster. */
function sizeFor(f: Film): TileSize {
  if (!standing[f.slug]) return "regular";
  return hasLandscapePoster(f.slug) ? "wide" : "regular";
}

const byRelease = (a: Film, b: Film) => (a.releaseDate ?? String(a.year)).localeCompare(b.releaseDate ?? String(b.year));

/**
 * Phones: the films as a Pinterest-style board. Mostly the official posters at their own shape,
 * every so often a still from the film for variety; the title and year under each. Tapping a pin
 * opens the same preview as the shelf. The films on the way close the board.
 */
function PhoneFilmBoard({ films, onOpen, closing }: { films: Film[]; onOpen: (film: Film, from: HTMLElement, viaKeyboard: boolean) => void; closing: boolean }) {
  const pins = films.map((f, i) => {
    const poster = filmPosters[f.slug];
    const still = i % 7 === 3 && f.image ? f.image : null;
    const ratio = still ? PIN_SHAPES[i % PIN_SHAPES.length] : poster ? poster.h / poster.w : 1.45;
    return { f, src: still ?? poster?.sm ?? f.image ?? null, ratio };
  });
  type Pin = (typeof pins)[number] | "next";
  const [left, right] = twoColumns<Pin>(closing ? [...pins, "next"] : pins, (p) => (p === "next" ? 1.2 : p.ratio + 0.3));
  const render = (p: Pin) =>
    p === "next" ? (
      <Link key="next" href="/upcoming" className="block rounded-[16px] bg-[linear-gradient(160deg,#e8731a,#9a3c08)] p-4 text-white shadow-[0_12px_26px_-16px_rgba(154,60,8,0.7)]">
        <span className="block text-[max(0.58rem,9px)] font-bold tracking-[0.22em] text-white/80 uppercase">Coming next</span>
        <ul className="mt-3 space-y-2">
          {NEXT_UP.map((n) => (
            <li key={n.title}>
              <span className="block font-display text-[1.02rem] leading-tight">{n.title}</span>
              {n.release && <span className="block text-[0.66rem] text-white/75">{n.release}</span>}
            </li>
          ))}
        </ul>
        <span className="mt-4 inline-block text-[max(0.6rem,9px)] font-bold tracking-[0.18em] uppercase">Upcoming films &rarr;</span>
      </Link>
    ) : (
      <button key={p.f.slug} type="button" onClick={(e) => onOpen(p.f, e.currentTarget, false)} className="block w-full text-left" aria-label={`${p.f.title} (${p.f.year})`}>
        <span className="relative block overflow-hidden rounded-[16px] bg-[#f1e4cf] shadow-[0_10px_24px_-16px_rgba(59,26,7,0.55)]" style={{ aspectRatio: `1 / ${p.ratio}` }}>
          {p.src ? (
            <Image src={p.src} alt="" fill sizes="48vw" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center bg-[linear-gradient(150deg,#e8731a,#7a2c06)] p-3 text-center font-display text-lg leading-tight text-white">{p.f.title}</span>
          )}
        </span>
        <span className="mt-2 line-clamp-2 block px-0.5 text-[0.8rem] leading-snug font-semibold text-[#2a1408]">{p.f.title}</span>
        <span className="mt-0.5 block px-0.5 text-[0.66rem] text-[#9a7558]">
          {p.f.year} · {p.f.roleLabel}
        </span>
      </button>
    );
  return <PinBoard className="mt-6 sm:hidden" left={left.map(render)} right={right.map(render)} />;
}

/** The films, first to latest, as a bento shelf of posters. */
export function FilmsExplorer({ films, lead, onDark = false }: { films: Film[]; /** The page title, on the same line as the tabs. */ lead?: ReactNode; /** The row sits over a film: white type. */ onDark?: boolean }) {
  const [cat, setCat] = useState<Cat>("all");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [preview, setPreview] = useState<Film | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const byKeyboard = useRef(false);
  const [calm, setCalm] = useState(false);

  const openPreview = useCallback((film: Film, from: HTMLElement, viaKeyboard: boolean) => {
    opener.current = from;
    byKeyboard.current = viaKeyboard;
    setPreview(film);
  }, []);
  // Keyboard users are taken back to the film they opened. With a mouse or a finger, focus is let
  // go instead: handing it back would leave that tile turned over on its note, as if still hovered.
  const closePreview = useCallback(() => {
    setPreview(null);
    setCalm(true);
    if (byKeyboard.current) opener.current?.focus({ preventScroll: true });
    else (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  // The preview's close button (or the backdrop) often sits over a tile, so closing leaves the
  // pointer resting on one, which would turn it over as if hovered. After a close, no tile turns
  // until the pointer moves on to another tile, off the tiles, or the page scrolls.
  useEffect(() => {
    if (!calm) return;
    let resting: Element | null | undefined;
    // The tile under the pointer, looking through the preview while it fades out.
    const tileAt = (x: number, y: number) =>
      document
        .elementsFromPoint(x, y)
        .map((el) => el.closest("article"))
        .find(Boolean) ?? null;
    const onMove = (e: PointerEvent) => {
      const tile = tileAt(e.clientX, e.clientY);
      if (resting === undefined) resting = tile;
      if (!tile || tile !== resting) setCalm(false);
    };
    const settle = () => setCalm(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("wheel", settle, { passive: true });
    window.addEventListener("touchstart", settle, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", settle);
      window.removeEventListener("touchstart", settle);
    };
  }, [calm]);

  // Deep links such as /films?role=related
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "core" || role === "presentation" || role === "related") setCat(role);
  }, []);

  const results = useMemo(
    () =>
      films
        .filter((f) => {
          if (cat !== "all" && f.category !== cat) return false;
          if (!q) return true;
          return [f.title, f.director, f.genre, f.music, ...f.cast, ...f.altNames].join(" ").toLowerCase().includes(q);
        })
        .sort(byRelease),
    [films, cat, q],
  );

  // The story ends on what is coming next.
  const showClosing = !q && cat !== "related";
  const gridRef = useRef<HTMLOListElement>(null);
  const [closing, setClosing] = useState<{ col: number; row: number; cols: number; rows: number } | null>(null);

  // Size the closing tile to the space the grid leaves after the last film (it differs with
  // the column count), so the shelf always ends square. Layout offsets ignore entrance transforms.
  useLayoutEffect(() => {
    const ol = gridRef.current;
    if (!ol || !showClosing) return;
    const measure = () => {
      const style = getComputedStyle(ol);
      const cols = style.gridTemplateColumns.split(" ").length;
      const gap = parseFloat(style.columnGap) || 0;
      const rowGap = parseFloat(style.rowGap) || 0;
      const items = [...ol.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.dataset.closing);
      if (!items.length) return;
      const colStride = (ol.clientWidth - (cols - 1) * gap) / cols + gap;
      const rowStride = Math.min(...items.map((el) => el.offsetHeight)) + rowGap;
      const taken = new Map<number, Set<number>>();
      let last = 0;
      for (const el of items) {
        const c0 = Math.round(el.offsetLeft / colStride);
        const r0 = Math.round(el.offsetTop / rowStride);
        const cs = Math.max(1, Math.round((el.offsetWidth + gap) / colStride));
        const rs = Math.max(1, Math.round((el.offsetHeight + rowGap) / rowStride));
        for (let r = r0; r < r0 + rs; r++) {
          const row = taken.get(r) ?? new Set<number>();
          for (let c = c0; c < c0 + cs; c++) row.add(c);
          taken.set(r, row);
          last = Math.max(last, r);
        }
      }
      // Empty columns at the right-hand end of a row.
      const freeAt = (r: number) => {
        const row = taken.get(r) ?? new Set<number>();
        let n = 0;
        for (let c = cols - 1; c >= 0 && !row.has(c); c--) n++;
        return n;
      };
      const fLast = freeAt(last);
      const fPrev = last > 0 ? freeAt(last - 1) : 0;
      let next: { col: number; row: number; cols: number; rows: number };
      if (fLast >= 1 && fPrev === fLast) next = { col: cols - fLast, row: last - 1, cols: fLast, rows: 2 };
      else if (fLast >= 2) next = { col: cols - fLast, row: last, cols: fLast, rows: 1 };
      else next = { col: 0, row: last + 1, cols, rows: cols <= 3 ? 2 : 1 };
      setClosing((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [results, showClosing]);

  return (
    <div>
      {/* Phones: the title, a search bar and the categories as chips */}
      <div className="sm:hidden">
        <p className="font-display text-[2.2rem] leading-none text-[#2a1408]">Our films</p>
        <p className="mt-2 text-[0.8rem] text-[#8a6a52]">{results.length} films, from Dil in 2003 to today</p>
        <label className="mt-5 flex items-center gap-2.5 rounded-full bg-[#f3ece3] px-4 py-2.5">
          <span className="sr-only">Search films</span>
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#8a6a52]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a film" className="w-full bg-transparent text-[0.88rem] text-[#2a1408] outline-none placeholder:text-[#9a7558]" />
        </label>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-6 overflow-x-auto border-b border-[#2a1408]/10 px-4" role="tablist" aria-label="Credit role">
          {CATS.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={cat === c.key}
              onClick={() => setCat(c.key)}
              className={cn("relative shrink-0 pb-2.5 text-[0.84rem] font-semibold transition-colors", cat === c.key ? "text-[#2a1408]" : "text-[#9a7558]")}
            >
              {c.label}
              {cat === c.key && <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[2px] bg-saffron-deep" />}
            </button>
          ))}
        </div>
      </div>

      {/* The title, the categories and search, on one line */}
      <div className={cn("flex flex-col gap-5 border-b max-sm:hidden lg:flex-row lg:items-end lg:justify-between", onDark ? "border-white/30" : "border-paper/15")}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-16">
          {lead && <div className="lg:pb-3">{lead}</div>}
          <div className="no-scrollbar -mx-4 flex gap-7 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Credit role">
            {CATS.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={cat === c.key}
                onClick={() => setCat(c.key)}
                className={cn(
                  "relative shrink-0 pb-3.5 transition-colors",
                  onDark ? "text-[0.95rem] font-semibold tracking-[0.04em] uppercase [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]" : "text-[0.82rem] font-medium",
                  cat === c.key ? (onDark ? "text-white" : "text-paper") : onDark ? "text-white/65 hover:text-white" : "text-dim hover:text-paper",
                )}
              >
                {c.label}
                {cat === c.key && <motion.span layoutId="cat-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-saffron" />}
              </button>
            ))}
          </div>
        </div>
        <label className={cn("relative mb-3 flex items-center sm:w-64", onDark && "[text-shadow:0_1px_10px_rgba(0,0,0,0.5)]")}>
          <span className="sr-only">Search films</span>
          <svg viewBox="0 0 20 20" className={cn("pointer-events-none absolute left-0 h-4 w-4", onDark ? "text-white/80" : "text-dim")} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className={cn("w-full bg-transparent py-1.5 pr-2 pl-7 text-sm outline-none", onDark ? "text-white placeholder:text-white/70" : "text-paper placeholder:text-dim")}
          />
        </label>
      </div>

      {results.length === 0 ? (
        <div className="py-32 text-center">
          <p className="text-lg text-mute">No films match “{query}”.</p>
          <button onClick={() => setQuery("")} className="mt-4 text-xs font-bold tracking-[0.18em] text-saffron-deep uppercase">
            Clear search
          </button>
        </div>
      ) : (
        <>
        <PhoneFilmBoard films={results} onOpen={openPreview} closing={showClosing} />
        <div className="films-bento-wrap mt-8 max-sm:hidden">
          <motion.ol ref={gridRef} layout className="films-bento relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((f, i) => {
                const size = sizeFor(f);
                return (
                  <motion.li
                    key={f.slug}
                    layout
                    className={cn(size === "large" && "col-span-2 row-span-2", size === "wide" && "col-span-2")}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.6, delay: Math.min(i, 11) * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <FilmTile film={f} size={size} onOpen={openPreview} priority={i < 4} calm={calm} />
                  </motion.li>
                );
              })}
              {showClosing && (
                <motion.li
                  key="coming-soon"
                  data-closing="true"
                  className={cn(!closing && "col-span-2 row-span-2")}
                  style={closing ? { gridColumn: `${closing.col + 1} / span ${closing.cols}`, gridRow: `${closing.row + 1} / span ${closing.rows}` } : undefined}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ComingSoonTile titles={NEXT_UP} />
                </motion.li>
              )}
            </AnimatePresence>
          </motion.ol>
        </div>
        </>
      )}

      <AnimatePresence>{preview && <FilmPreview key={preview.slug} film={preview} onClose={closePreview} />}</AnimatePresence>
    </div>
  );
}
