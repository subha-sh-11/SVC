"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Milestone } from "@/data/types";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/motion";
import { MilestoneImage } from "./MilestoneArt";
import { MilestoneSheet } from "./MilestoneSheet";
import { PIN_SHAPES, PinBoard, twoColumns } from "@/components/ui/Pins";
import { imageRatios } from "@/data/imageRatios";
import { journeyImages } from "@/data/journeyImages";

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
      <p className="text-[max(0.62rem,9px)] font-bold tracking-[0.26em] text-saffron-deep uppercase">{heading.eyebrow}</p>
      <h2 className="display mt-2 text-3xl leading-none sm:text-4xl">{heading.title}</h2>
    </div>
  );
}

/** "Read more", under each card: the whole card opens its story. */
function ReadMore() {
  return (
    <span className="mt-4 inline-flex items-center gap-2 text-[max(0.65rem,9px)] font-bold tracking-[0.2em] text-saffron-deep uppercase">
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
      <div className="max-sm:hidden lg:hidden">
        <VerticalTimeline items={items} label={label} heading={heading} onOpen={onOpen} />
      </div>
      <div className="sm:hidden">
        <PhoneMilestones items={items} label={label} heading={heading} onOpen={onOpen} />
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
            <article
              key={`${m.date}-${m.title}`}
              className={`group relative flex w-[30rem] shrink-0 flex-col ${i % 2 ? "translate-y-[12%] short:translate-y-[4%]" : "-translate-y-[12%] short:-translate-y-[4%]"}`}
            >
              <div className="relative transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
                <MilestoneImage m={m} sizes="480px" className="transition-shadow duration-500 group-hover:shadow-[0_30px_50px_-24px_rgba(59,26,7,0.6)] short:aspect-[2.2/1]" />
                <span className="absolute -bottom-3 left-6 h-6 w-6 rounded-full border border-gold bg-ink shadow-sm">
                  <span className="absolute inset-1.5 rounded-full bg-gold" />
                </span>
              </div>
              <div className="mt-8 pr-6 short:mt-6">
                <p className="tabular-nums tracking-[0.06em] text-xs text-gold">{displayDate(m)}</p>
                <p className="mt-3 text-[max(0.62rem,9px)] font-bold tracking-[0.22em] text-mute uppercase short:mt-2">{m.type}</p>
                <h3 className="display mt-2 text-4xl transition-colors group-hover:text-saffron-deep short:text-3xl">{m.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-mute short:mt-2 short:line-clamp-2">{m.description}</p>
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

/**
 * Phones: the milestones as a Pinterest-style board. Each is a pin: its picture (whole) or its
 * films' posters, then when, what kind of moment, and its title. Tapping a pin opens the whole story.
 */
function PhoneMilestones({ items, label, heading, onOpen }: { items: Milestone[]; label: string; heading?: Heading; onOpen: Open }) {
  // A picture pin takes the picture's own shape (no wider than 16:9), so it shows whole; posters
  // fanned out and title cards take the board's taller shapes.
  const shape = (i: number) => {
    const m = items[i];
    if (m.posters?.length) return PIN_SHAPES[i % PIN_SHAPES.length];
    const src = m.title in journeyImages ? journeyImages[m.title]?.src : m.image;
    const r = src ? imageRatios[src] : undefined;
    return r ? Math.max(0.5625, r) : PIN_SHAPES[i % PIN_SHAPES.length];
  };
  const [left, right] = twoColumns(items, (_, i) => shape(i) + 0.55);
  const pin = (m: Milestone) => {
    const i = items.indexOf(m);
    return (
      <button key={`${m.date}-${m.title}`} type="button" onClick={(e) => onOpen(m, e.currentTarget)} aria-haspopup="dialog" aria-label={`${m.title} (${displayDate(m)}): read more`} className="block w-full text-left">
        <span className="relative block" style={{ aspectRatio: `1 / ${shape(i)}` }}>
          <MilestoneImage m={m} sizes="48vw" className="!absolute inset-0 !aspect-auto !rounded-[16px] !shadow-[0_10px_24px_-16px_rgba(59,26,7,0.55)] [&_span.font-title]:!text-[1.35rem]" />
        </span>
        <span className="mt-2 block px-0.5 text-[max(0.58rem,9px)] font-bold tracking-[0.16em] text-saffron-deep uppercase">{displayDate(m)}</span>
        <span className="mt-1 block px-0.5 font-display text-[1rem] leading-tight text-[#2a1408]">{m.title}</span>
        <span className="mt-1 line-clamp-1 block px-0.5 text-[0.66rem] text-[#8a6a52]">{m.type}</span>
      </button>
    );
  };
  return (
    <section className="shell" aria-label={label}>
      {heading && (
        <div className="mb-5">
          <ReelHeading heading={heading} />
        </div>
      )}
      <PinBoard left={left.map(pin)} right={right.map(pin)} />
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
            <p className="mt-2 text-[max(0.62rem,9px)] font-bold tracking-[0.22em] text-mute uppercase">{m.type}</p>
            <h3 className="display mt-2 text-[1.9rem] leading-[1.08] sm:text-4xl">{m.title}</h3>
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
