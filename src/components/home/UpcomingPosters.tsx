"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTrailer } from "@/components/providers/TrailerProvider";
import { PlayIcon } from "@/components/ui/Buttons";
import { reelUpcoming } from "@/data/reel";
import { cn } from "@/lib/utils";

/** In release order; each with a still from its official glimpse (no lettering on it). */
const ORDER = ["rowdy-janardhana", "markandeya", "yellamma", "svc63", "dethadi"];
const STORIES = ORDER.flatMap((slug) => {
  const u = reelUpcoming.find((x) => x.slug === slug);
  return u ? [{ ...u, still: `/images/upcoming-stills/${slug}.jpg` }] : [];
});
/** One pass of the row: the films twice when there is an odd number, so high and low keep alternating round the loop. */
const PASS = STORIES.length % 2 ? [...STORIES, ...STORIES] : STORIES;
/** Enough passes to fill the widest screens while it glides. */
const COPIES = 2;
const INK = "#1a0f08";

/**
 * The films on the way, as a row of stills gliding slowly by: one high with its name beneath, the
 * next low with its name above, and so on (as on a cinema's board). It pauses under the pointer and
 * can be dragged; a still opens the film's glimpse, a name its announcement.
 */
export function UpcomingPosters() {
  const openTrailer = useTrailer();
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const [passWidth, setPassWidth] = useState(0);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const measure = () => setPassWidth(el.scrollWidth / COPIES);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x = useMotionValue(0);
  // Start with the first still lined up under the section's heading (its column's left edge).
  useEffect(() => {
    const el = rowRef.current;
    const column = el?.closest("section")?.querySelector<HTMLElement>(".shell");
    if (!el || !column) return;
    const start = column.getBoundingClientRect().left + parseFloat(getComputedStyle(column).paddingLeft) - el.parentElement!.getBoundingClientRect().left;
    // One pass back, so stills fill the left edge as well from the first frame.
    x.set(passWidth ? start - passWidth : start);
  }, [x, passWidth]);
  const [hover, setHover] = useState(false);
  const drag = useRef<{ px: number; x: number } | null>(null);
  const moved = useRef(false);
  /** Keep x within one pass's width, so the row never runs out. */
  const wrap = (v: number) => (passWidth ? -(((-v % passWidth) + passWidth) % passWidth) : v);
  useAnimationFrame((_, dt) => {
    if (reduce || hover || drag.current || !passWidth) return;
    x.set(wrap(x.get() - dt * 0.035));
  });

  return (
    <div
      className="relative cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={(e) => {
        drag.current = { px: e.clientX, x: x.get() };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.px;
        if (Math.abs(dx) > 6) moved.current = true;
        x.set(wrap(d.x + dx));
      }}
      // A drag that ends on a still is not a click on it.
      onClickCapture={(e) => {
        if (moved.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <motion.div
        ref={rowRef}
        // --w: a still's width; --d: how much lower every other one sits (its name fills the space above).
        className="flex w-max items-start gap-[clamp(14px,1.6vw,26px)] pr-[clamp(14px,1.6vw,26px)] [--d:calc(var(--w)*0.155)] [--w:clamp(270px,26vw,440px)]"
        style={{ x, color: INK }}
      >
        {Array.from({ length: COPIES }, (_, c) =>
          PASS.map((s, k) => {
            const first = c === 0 && k < STORIES.length; // the rest repeat the same films: hidden from screen readers
            const low = k % 2 === 1;
            const caption = (
              <div className={cn("flex items-start gap-2.5", low ? "h-[var(--d)] items-end pb-3" : "pt-3")}>
                <div className="flex items-start gap-2.5">
                  <Link
                    href={`/upcoming#${s.slug}`}
                    tabIndex={first ? undefined : -1}
                    draggable={false}
                    className="font-title text-[calc(var(--w)*0.074)] leading-[0.92] tracking-[0.005em] whitespace-nowrap uppercase transition-colors hover:text-saffron-deep"
                  >
                    {s.title}
                  </Link>
                  <span className="mt-[0.2em] text-[max(0.6rem,9px)] leading-[1.35] font-medium tracking-[0.14em] whitespace-nowrap uppercase sm:text-[max(0.66rem,9px)]">
                    Coming
                    <br />
                    {s.short}
                  </span>
                </div>
              </div>
            );
            return (
              <div key={`${s.slug}-${c}-${k}`} className="w-[var(--w)] shrink-0" aria-hidden={first ? undefined : true}>
                {low && caption}
                <button
                  type="button"
                  data-header-theme="dark"
                  tabIndex={first ? 0 : -1}
                  onClick={() => openTrailer({ youtubeId: s.youtubeId, title: s.title, label: s.label })}
                  aria-label={`${s.title} (${s.when}): watch the ${s.label.toLowerCase()}`}
                  className="group relative block aspect-video w-full overflow-hidden bg-[#120904]"
                >
                  <Image
                    src={s.still}
                    alt=""
                    fill
                    draggable={false}
                    sizes="(min-width: 768px) 36vw, 270px"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-3 inline-flex translate-y-2 items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[max(0.62rem,9px)] font-bold tracking-[0.14em] text-black uppercase opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <PlayIcon className="h-3 w-3" />
                    {s.label}
                  </span>
                </button>
                {!low && caption}
              </div>
            );
          }),
        )}
      </motion.div>
    </div>
  );
}
