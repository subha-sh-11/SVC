"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { posterWall, type PosterTile } from "@/data/posters";
import { letterGrid, letterOutline } from "@/data/svcLetterCells";
import { ArrowIcon } from "@/components/ui/Buttons";

/**
 * The SVC lockup: the god symbol beside "SVC" (Playfair letters filled with one
 * poster per SVC production, in gold), the name below, and the hero's line and
 * buttons below that. The opening sequence and the home hero render this same
 * component in the same place, so the intro can dissolve straight into the hero.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
export const FULL_NAME = "Sri Venkateswara Creations";
const LETTERS_ASPECT = 2003 / 736; // public/brand/svc-letters.svg
const FLIGHT = 1.7; // seconds a poster takes to fly into place

export type LockupStage = "hidden" | "assemble" | "crisp" | "brand";

/** Small deterministic random generator, so every visit gets the same choreography. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One poster per cell of the letters (47 cells, 47 productions), each with its own throw. */
const TILES = (() => {
  const rand = seeded(2003);
  const order = posterWall.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return letterGrid.cells.map(([col, row], i) => ({
    col,
    row,
    poster: posterWall[order[i % order.length]],
    from: { x: rand() * 1.3 - 0.15, y: rand() * 1.3 - 0.15 }, // start, as a fraction of the screen
    spin: (rand() - 0.5) * 80,
    delay: rand() * 1.0,
  }));
})();

/** Every poster used inside the letters, for preloading. */
export const LOCKUP_POSTERS = Array.from(new Set(TILES.map((t) => t.poster.sm)));

// Cell geometry in container units of the letters' box (so it renders correctly before any JS).
const CW = 100 / letterGrid.cols; // cell width, cqw
const CH = CW * 1.5; // cell height, cqw (2:3 tiles)
const GAP = CW * 0.06; // seam between posters, cqw
const cellStyle = (col: number, row: number) => ({
  left: `${col * CW}cqw`,
  top: `${row * CH}cqw`,
  width: `${CW - GAP}cqw`,
  height: `${CH - GAP}cqw`,
});

const MASK = {
  WebkitMaskImage: "url(/brand/svc-letters.svg)",
  maskImage: "url(/brand/svc-letters.svg)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
} as const;

function Poster({ tile }: { tile: PosterTile }) {
  // eslint-disable-next-line @next/next/no-img-element -- 47 small decorative tiles, preloaded
  return <img src={tile.sm} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: tile.position }} />;
}

/** The letters: a faint golden SVC, posters landing inside it, then full gold seams and a gold rim. */
function Letters({ stage, still, glint }: { stage: LockupStage; still: boolean; glint: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const flying = !still && stage !== "hidden";
  const done = still || stage === "crisp" || stage === "brand";
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Where the letters sit on screen, so each poster can be thrown in from its own spot.
  useLayoutEffect(() => {
    if (flying && boxRef.current) setRect(boxRef.current.getBoundingClientRect());
  }, [flying]);

  const land = (delay: number) => delay + FLIGHT * 0.82; // when a poster settles into its cell

  return (
    <div ref={boxRef} data-svc-letters="" className="relative w-[var(--lw)] [container-type:inline-size]" style={{ aspectRatio: LETTERS_ASPECT }}>
      {/* Golden SVC: faint while the posters arrive, then full gold (seams and edges) */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(135deg,#a9781e_0%,#e8b53a_28%,#ffd873_46%,#e8b53a_62%,#b8862a_100%)]"
        style={MASK}
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: done ? 1 : flying ? 0.28 : 0 }}
        transition={{ duration: done ? 0.8 : 0.9, ease: "easeInOut" }}
      />

      {/* Posters cut to the letters; in the intro each appears as its flying copy lands */}
      <div className="absolute inset-0" style={MASK}>
        {TILES.map((t, i) => (
          <motion.div
            key={i}
            className="absolute overflow-hidden"
            style={cellStyle(t.col, t.row)}
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: still || flying ? 1 : 0 }}
            transition={{ delay: flying ? land(t.delay) : 0, duration: 0.22 }}
          >
            <Poster tile={t.poster} />
          </motion.div>
        ))}
      </div>

      {/* A soft light that glints across the gold now and then (hero only) */}
      {glint && <div aria-hidden="true" className="svc-glint pointer-events-none absolute inset-0" style={MASK} />}

      {/* The posters in flight (intro only): thrown in from across the screen */}
      {flying && rect && (
        <div className="pointer-events-none absolute inset-0">
          {TILES.map((t, i) => {
            const cw = rect.width / letterGrid.cols;
            const left = t.col * cw;
            const top = t.row * cw * 1.5;
            return (
              <motion.div
                key={i}
                className="absolute overflow-hidden bg-[#e9e2d8] shadow-[0_10px_24px_-8px_rgba(59,26,7,0.42)]"
                style={cellStyle(t.col, t.row)}
                initial={{
                  x: t.from.x * window.innerWidth - (rect.left + left),
                  y: t.from.y * window.innerHeight - (rect.top + top),
                  rotate: t.spin,
                  scale: 1.9,
                  opacity: 0,
                }}
                animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: [0, 1, 1, 0] }}
                transition={{
                  delay: t.delay,
                  duration: FLIGHT,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { delay: t.delay, duration: FLIGHT * 0.82 + 0.22, times: [0, 0.18, 0.78, 1], ease: "linear" },
                }}
              >
                <Poster tile={t.poster} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Gold rim around S, V and C (traced in the intro; already drawn in the hero) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={letterOutline.viewBox} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a9781e" />
            <stop offset="30%" stopColor="#e8b53a" />
            <stop offset="48%" stopColor="#ffd873" />
            <stop offset="66%" stopColor="#e8b53a" />
            <stop offset="100%" stopColor="#a9781e" />
          </linearGradient>
        </defs>
        <motion.path
          d={letterOutline.d}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={2.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={still ? false : { pathLength: 0, opacity: 0 }}
          animate={still || flying ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ pathLength: { delay: 0.2, duration: 2.8, ease: "easeInOut" }, opacity: { delay: 0.15, duration: 0.3 } }}
        />
      </svg>
    </div>
  );
}

function Name({ as: Tag, still }: { as: "p" | "h1"; still: boolean }) {
  return (
    <Tag className="flex justify-center overflow-hidden pt-[0.06em] pb-[0.14em] font-display text-[clamp(1.3rem,3.4vw,4.4rem)] leading-[1.04] font-medium tracking-[-0.015em] whitespace-nowrap text-[#3b1a07]">
      {FULL_NAME.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={still ? false : { y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ delay: 0.3 + i * 0.04, duration: 0.95, ease: EASE }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </Tag>
  );
}

/** The hero's line and buttons under the name. Always laid out (so the lockup never moves). */
function Extras({ show }: { show: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 text-center"
      style={{ visibility: show ? "visible" : "hidden" }}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.9, ease: EASE, delay: show ? 0.25 : 0 }}
    >
      <p className="flex items-center gap-3 text-[0.66rem] font-semibold tracking-[0.34em] text-[#9a7558] uppercase sm:text-[0.72rem]">
        <span className="hidden h-px w-8 bg-gradient-to-r from-transparent to-[#e8731a] sm:block" />
        Telugu cinema since 2003 · Hyderabad
        <span className="hidden h-px w-8 bg-gradient-to-l from-transparent to-[#e8731a] sm:block" />
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <Link
          href="/films"
          tabIndex={show ? undefined : -1}
          className="group inline-flex items-center gap-3 bg-[linear-gradient(180deg,#e8731a,#c2520e)] px-7 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-white uppercase shadow-[0_12px_28px_-12px_rgba(194,82,14,0.7)] transition-[filter] hover:brightness-110"
        >
          Explore our films
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
        <a
          href="#showreel"
          tabIndex={show ? undefined : -1}
          className="group inline-flex items-center gap-3 text-[0.7rem] font-bold tracking-[0.22em] text-[#3b1a07]/75 uppercase transition-colors hover:text-[#3b1a07]"
        >
          <span className="link-underline pb-1">Watch the showreel</span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#e8731a]/40 text-[#c2520e] transition group-hover:border-[#c2520e]">
            <ArrowIcon className="rotate-90" />
          </span>
        </a>
      </div>
    </motion.div>
  );
}

export function SvcLockup({
  stage,
  still = false,
  nameAs = "p",
  showExtras = false,
  glint = false,
  children,
}: {
  stage: LockupStage;
  /** Render the finished lockup at once, with no build-up (the hero). */
  still?: boolean;
  nameAs?: "p" | "h1";
  showExtras?: boolean;
  glint?: boolean;
  children?: ReactNode;
}) {
  const branded = still || stage === "brand";
  return (
    <div className="flex flex-col items-center gap-[clamp(1.1rem,3vh,2.5rem)]">
      <div className="flex items-center gap-[clamp(0.75rem,2.4vw,2.5rem)] [--lw:min(68vw,1240px)] sm:[--lw:min(62vw,1240px)]">
        <div className="relative aspect-[606/906] h-[calc(var(--lw)/2.72*1.22)] shrink-0" style={{ visibility: branded ? "visible" : "hidden" }}>
          <motion.div
            key={branded ? "on" : "off"}
            className="absolute inset-0"
            initial={still ? false : { opacity: 0, y: 18, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Image src="/brand/svc-deity.png" alt="" fill loading="eager" sizes="(min-width: 640px) 18vw, 22vw" className="object-contain" />
          </motion.div>
        </div>
        <Letters stage={stage} still={still} glint={glint} />
      </div>
      <div className="w-full" style={{ visibility: branded ? "visible" : "hidden" }}>
        <Name key={branded ? "on" : "off"} as={nameAs} still={still} />
      </div>
      <Extras show={showExtras} />
      {children}
    </div>
  );
}
