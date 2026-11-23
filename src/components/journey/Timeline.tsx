"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Milestone } from "@/data/types";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/motion";
import { MilestoneImage } from "./MilestoneArt";
import { MilestoneSheet } from "./MilestoneSheet";

function yearOf(m: Milestone) {
  const y = /(\d{4})/.exec(m.date);
  return y ? y[1] : m.date;
}

export function displayDate(m: Milestone) {
  return /^\d{4}-\d{2}-\d{2}$/.test(m.date) ? formatDate(m.date) : m.date;
}

type Heading = { eyebrow: string; title: string };
type Open = (m: Milestone, from: HTMLElement) => void;

function ReelHeading({ heading }: { heading: Heading }) {
  return (
    <div>
      <p className="text-[0.62rem] font-bold tracking-[0.26em] text-saffron-deep uppercase">{heading.eyebrow}</p>
      <h2 className="display mt-2 text-3xl leading-none sm:text-4xl">{heading.title}</h2>
    </div>
  );
}

/** "Read more", under each card: the whole card opens its story. */
function ReadMore() {
  return (
    <span className="mt-4 inline-flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.2em] text-saffron-deep uppercase">
      Read more
      <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-saffron-deep text-[0.8rem] leading-none text-white transition-transform duration-300 group-hover:rotate-90">
        +
      </span>
    </span>
  );
}

/** Covers the card, so a click anywhere on it opens the milestone. */
function CardButton({ m, onOpen }: { m: Milestone; onOpen: Open }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(m, e.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`${m.title} (${displayDate(m)}): read more`}
      className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-offset-8"
    />
  );
}

/**
 * Desktop gets the pinned horizontal reel; smaller screens a drawn vertical line. Any card opens
 * into a sheet with the whole story and its films.
 */
export function Timeline({ items, label = "Milestone timeline", heading }: { items: Milestone[]; label?: string; heading?: Heading }) {
  const [open, setOpen] = useState<Milestone | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const onOpen = useCallback<Open>((m, from) => {
    opener.current = from;
    setOpen(m);
  }, []);
  const onClose = useCallback(() => {
    setOpen(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <div className="hidden lg:block">
        <HorizontalTimeline items={items} label={label} heading={heading} onOpen={onOpen} />
      </div>
      <div className="lg:hidden">
        <VerticalTimeline items={items} label={label} heading={heading} onOpen={onOpen} />
      </div>
      <AnimatePresence>{open && <MilestoneSheet key={open.title} m={open} onClose={onClose} />}</AnimatePresence>
    </>
  );
}

function HorizontalTimeline({ items, label, heading, onOpen }: { items: Milestone[]; label: string; heading?: Heading; onOpen: Open }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (trackRef.current) setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -distance]), { stiffness: 140, damping: 30, mass: 0.35 });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  // Current year readout, driven by progress through the reel.
  const [active, setActive] = useState(0);
  useLayoutEffect(() => scrollYProgress.on("change", (v) => setActive(Math.min(items.length - 1, Math.round(v * (items.length - 1))))), [scrollYProgress, items.length]);

  return (
    <section ref={sectionRef} style={{ height: `calc(100vh + ${distance}px)` }} className="relative" aria-label={label}>
      <div className={`sticky top-0 flex h-screen flex-col justify-center overflow-hidden ${heading ? "[@media(min-height:800px)]:pt-20" : ""}`}>
        {heading && (
          <div className="pointer-events-none absolute top-28 left-[max(3rem,calc((100vw-1600px)/2+3rem))] hidden [@media(min-height:800px)]:block">
            <ReelHeading heading={heading} />
          </div>
        )}
        {/* Year readout */}
        <div className="pointer-events-none absolute top-24 right-[4vw] text-right">
          <motion.p key={yearOf(items[active])} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="display text-[7.5rem] leading-none text-transparent [-webkit-text-stroke:1px_rgba(196,82,12,0.4)]">
            {yearOf(items[active])}
          </motion.p>
        </div>

        <motion.div ref={trackRef} style={{ x }} className="relative flex w-max items-center gap-10 pr-[20vw] pl-[max(3rem,calc((100vw-1600px)/2+3rem))]">
          {/* Rail */}
          <div className="absolute top-1/2 right-0 left-0 h-px bg-gold/15" />
          {items.map((m, i) => (
            <article key={`${m.date}-${m.title}`} className={`group relative flex w-[30rem] shrink-0 flex-col ${i % 2 ? "translate-y-[12%]" : "-translate-y-[12%]"}`}>
              <div className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
                <MilestoneImage m={m} sizes="480px" className="transition-shadow duration-500 group-hover:shadow-[0_30px_50px_-24px_rgba(59,26,7,0.6)]" />
                <span className="absolute -bottom-3 left-6 h-6 w-6 rounded-full border border-gold bg-ink shadow-sm">
                  <span className="absolute inset-1.5 rounded-full bg-gold" />
                </span>
              </div>
              <div className="mt-8 pr-6">
                <p className="tabular-nums tracking-[0.06em] text-xs text-gold">{displayDate(m)}</p>
                <p className="mt-3 text-[0.62rem] font-bold tracking-[0.22em] text-mute uppercase">{m.type}</p>
                <h3 className="display mt-2 text-4xl transition-colors group-hover:text-saffron-deep">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{m.description}</p>
                <ReadMore />
              </div>
              <CardButton m={m} onOpen={onOpen} />
            </article>
          ))}
        </motion.div>

        {/* Progress */}
        <div className="shell absolute inset-x-0 bottom-10">
          <div className="flex items-center gap-6">
            <span className="tabular-nums tracking-[0.06em] text-xs text-dim">{yearOf(items[0])}</span>
            <div className="h-px flex-1 bg-gold/15">
              <motion.div className="h-px origin-left bg-gold" style={{ scaleX: progress }} />
            </div>
            <span className="tabular-nums tracking-[0.06em] text-xs text-dim">{yearOf(items[items.length - 1])}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalTimeline({ items, label, heading, onOpen }: { items: Milestone[]; label: string; heading?: Heading; onOpen: Open }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section className="shell py-10" aria-label={label}>
      {heading && (
        <div className="mb-10">
          <ReelHeading heading={heading} />
        </div>
      )}
      <ol ref={ref} className="relative pl-10">
        <div className="absolute top-0 bottom-0 left-[11px] w-px bg-gold/15" />
        <motion.div className="absolute top-0 bottom-0 left-[11px] w-px origin-top bg-gold" style={{ scaleY }} />
        {items.map((m) => (
          <Reveal as="li" key={`${m.date}-${m.title}`} className="group relative pb-16">
            <span className="absolute top-1 -left-10 h-6 w-6 rounded-full border border-gold bg-ink">
              <span className="absolute inset-1.5 rounded-full bg-gold" />
            </span>
            <p className="tabular-nums tracking-[0.06em] text-xs text-gold">{displayDate(m)}</p>
            <p className="mt-2 text-[0.62rem] font-bold tracking-[0.22em] text-mute uppercase">{m.type}</p>
            <h3 className="display mt-2 text-4xl">{m.title}</h3>
            <div className="mt-5">
              <MilestoneImage m={m} sizes="100vw" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mute">{m.description}</p>
            <ReadMore />
            <CardButton m={m} onOpen={onOpen} />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
