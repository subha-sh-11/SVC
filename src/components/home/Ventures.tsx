"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTrailer } from "@/components/providers/TrailerProvider";
import { PlayIcon } from "@/components/ui/Buttons";
import { Reveal } from "@/components/ui/motion";
import { offices, ventures, type Venture, type VentureLink } from "@/data/ventures";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ external }: { external?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-3 w-3 transition-transform", external ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : "group-hover:translate-x-1")} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {external ? <path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function VentureAction({ link }: { link: VentureLink }) {
  const openTrailer = useTrailer();
  const cls = "group inline-flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.18em] text-[#2a1408] uppercase transition-colors hover:text-saffron-deep";
  if ("video" in link) {
    const v = link.video;
    return (
      <button type="button" className={cls} onClick={() => openTrailer({ youtubeId: v.id, title: v.title, label: v.label, start: v.start })}>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2a1408] text-white transition-colors group-hover:bg-saffron-deep">
          <PlayIcon className="h-2.5 w-2.5" />
        </span>
        {link.label}
      </button>
    );
  }
  if (link.external)
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="link-underline pb-0.5">{link.label}</span>
        <Arrow external />
      </a>
    );
  return (
    <Link href={link.href} className={cls}>
      <span className="link-underline pb-0.5">{link.label}</span>
      <Arrow />
    </Link>
  );
}

/** One venture: its picture (with its mark), then the story. Tells the column beside it when it is the one being read. */
function VentureCard({ v, i, onActive }: { v: Venture; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const reading = useInView(ref, { margin: "-42% 0px -42% 0px" });
  useEffect(() => {
    if (reading) onActive(i);
  }, [reading, i, onActive]);

  return (
    <li ref={ref} id={`venture-${v.key}`} className="scroll-mt-24">
      <Reveal y={48}>
        <figure className="group relative aspect-[16/9] overflow-hidden rounded-[20px] short:aspect-[2.2/1] bg-[#f1e4cf] shadow-[0_34px_70px_-34px_rgba(59,26,7,0.55)] ring-1 ring-black/[0.05]">
          <Image
            src={v.image.src}
            alt={v.image.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            style={v.image.position ? { objectPosition: v.image.position } : undefined}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
          {v.logo && (
            <span
              className={cn(
                "absolute top-4 left-4 grid place-items-center rounded-[12px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] sm:top-5 sm:left-5",
                v.logo.plate === "light" ? "bg-white/95 px-3.5 py-2.5" : "bg-black/90 p-1.5",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- the venture's own mark, sized by height */}
              <img src={v.logo.src} alt={`${v.name} logo`} className={cn("w-auto", v.logo.w / v.logo.h > 2 ? "h-6 sm:h-8" : "h-14 sm:h-[4.5rem]")} />
            </span>
          )}
          {v.inset && (
            <span className="absolute right-4 bottom-4 w-[42%] overflow-hidden rounded-[10px] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] ring-1 ring-white/25 sm:right-5 sm:bottom-5 sm:w-[36%]">
              <Image src={v.inset.src} alt="" width={v.inset.w} height={v.inset.h} sizes="(min-width: 1024px) 22vw, 40vw" className="block h-auto w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-4 pb-1.5 text-[max(0.55rem,9px)] font-bold tracking-[0.16em] text-white uppercase sm:text-[max(0.6rem,9px)]">
                {v.inset.label}
              </span>
            </span>
          )}
          {/* Phones and tablets: the year sits on the picture (wide screens show it in the column) */}
          <span aria-hidden="true" className="absolute top-3 right-4 font-title text-4xl leading-none text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)] sm:text-5xl lg:hidden">
            {v.year}
          </span>
          <figcaption className="absolute bottom-2.5 left-4 text-[max(0.55rem,9px)] text-white/80 sm:left-5">{v.credit}</figcaption>
        </figure>
      </Reveal>

      <Reveal y={20} delay={0.08} className="mt-7 grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10">
        <div>
          <p className="text-[max(0.62rem,9px)] font-bold tracking-[0.3em] text-saffron-deep uppercase">
            <span className="lg:hidden">
              {v.month ? `${v.month} ` : ""}
              {v.year} ·{" "}
            </span>
            {v.kind}
          </p>
          <h3 className="mt-3 font-display text-[clamp(1.9rem,3.1vw,3rem)] leading-[1.02] font-medium text-paper">{v.name}</h3>
          <p className="mt-3 font-display text-[clamp(1.05rem,1.4vw,1.3rem)] leading-snug text-[#8a4a1c] italic">{v.line}</p>
        </div>
        <div>
          <p className="text-[0.95rem] leading-relaxed text-mute">{v.body}</p>
          {/* A few more things worth knowing */}
          <ul className="mt-4 space-y-2.5">
            {v.highlights.map((h) => (
              <li key={h} className="text-[0.88rem] leading-relaxed text-paper/80">
                {h}
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${v.name} at a glance`}>
            {v.facts.map((f) => (
              <li key={f} className="rounded-full border border-saffron/30 bg-white/70 px-3 py-1 text-[0.7rem] font-semibold text-[#6f4b2f]">
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {v.links.map((l) => (
              <VentureAction key={l.label} link={l} />
            ))}
          </div>
        </div>
      </Reveal>
    </li>
  );
}

/** Wide screens: the year of the venture being read, large, with the list of all of them. */
function YearColumn({ active, go }: { active: number; go: (i: number) => void }) {
  const v = ventures[active];
  return (
    <div className="sticky top-[18vh]">
      <p className="text-[max(0.66rem,9px)] font-bold tracking-[0.3em] text-saffron-deep uppercase">
        {pad(active + 1)} <span className="text-dim">/ {pad(ventures.length)}</span>
      </p>
      <div className="relative mt-4 h-[clamp(6.5rem,10vw,9.5rem)] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.p
            key={v.key}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,#e8731a,#9a3c08)] bg-clip-text font-title text-[clamp(6.5rem,10vw,9.5rem)] leading-none text-transparent"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            exit={{ y: "-105%" }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            {v.year}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-2 h-4 text-[0.7rem] font-semibold tracking-[0.24em] text-dim uppercase">{v.month ?? ""}</p>
      <ol className="mt-10 space-y-1 border-l border-saffron/20">
        {ventures.map((x, i) => (
          <li key={x.key}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === active}
              className={cn(
                "relative -ml-px block border-l-2 py-1.5 pl-4 text-left text-[0.8rem] transition-colors",
                i === active ? "border-saffron-deep font-semibold text-paper" : "border-transparent text-dim hover:text-mute",
              )}
            >
              {x.name}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Beyond the banner: what Dil Raju has started, from distribution in 1999 to an AI studio and a
 * platform for new talent, and the public offices he has held in the film industry.
 */
export function Ventures() {
  const [active, setActive] = useState(0);
  const onActive = useCallback((i: number) => setActive(i), []);
  const go = useCallback((i: number) => {
    document.getElementById(`venture-${ventures[i].key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="ventures" aria-labelledby="ventures-title" className="relative bg-[#fffaf3] py-24 sm:py-32">
      <div className="shell">
        <Reveal y={14}>
          <p className="eyebrow flex items-center gap-3">
            Started by Dil Raju
          </p>
        </Reveal>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={24}>
            <h2 id="ventures-title" className="font-display text-4xl leading-[1.04] font-medium text-paper sm:text-5xl lg:text-6xl">
              Beyond the <span className="text-gold-gradient italic">banner</span>
            </h2>
          </Reveal>
          <Reveal y={16} delay={0.15} className="max-w-md">
            <p className="text-[0.95rem] leading-relaxed text-mute lg:text-right">
              From a distribution office in 1999 to an AI studio and an open door for new talent: what Dil Raju has started, and the offices he has held.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 lg:mt-24 lg:grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,2fr)] lg:gap-16 xl:gap-24">
          <aside className="hidden lg:block" aria-label="Ventures by year">
            <YearColumn active={active} go={go} />
          </aside>
          <ol className="space-y-20 sm:space-y-28 lg:space-y-36">
            {ventures.map((v, i) => (
              <VentureCard key={v.key} v={v} i={i} onActive={onActive} />
            ))}
          </ol>
        </div>

        {/* In public office */}
        <div className="mt-24 sm:mt-32">
          <Reveal y={14}>
            <p className="eyebrow flex items-center gap-3">
              In public office
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offices.map((o, i) => (
              <Reveal
                key={o.body}
                as="article"
                delay={i * 0.1}
                className={cn(
                  "group relative overflow-hidden rounded-[20px] p-7 sm:p-9",
                  o.current ? "bg-[linear-gradient(135deg,#3b1a07,#2a1408_60%,#4a2410)] text-[#fffaf3] shadow-[0_34px_70px_-34px_rgba(59,26,7,0.7)]" : "bg-white ring-1 ring-black/[0.07]",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className={cn("text-[max(0.66rem,9px)] font-bold tracking-[0.26em] uppercase", o.current ? "text-[#f2c230]" : "text-saffron-deep")}>{o.when}</p>
                  {o.current && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[max(0.6rem,9px)] font-bold tracking-[0.2em] text-white uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#46d369]" aria-hidden="true" />
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-8 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className={cn("text-[0.7rem] font-semibold tracking-[0.24em] uppercase", o.current ? "text-white/70" : "text-dim")}>{o.title}</p>
                    <h3 className={cn("mt-2 font-display text-[clamp(1.6rem,2.5vw,2.3rem)] leading-[1.08] font-medium", o.current ? "text-[#fffaf3]" : "text-paper")}>{o.body}</h3>
                    <p className={cn("mt-4 max-w-md text-[0.85rem] leading-relaxed", o.current ? "text-white/70" : "text-mute")}>{o.note}</p>
                  </div>
                  {/* The body's own logo as a die-cut sticker pressed on at a slight tilt; it straightens and lifts a little on hover */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- small logo, already cut round */}
                  <img
                    src={o.logo.src}
                    alt={o.logo.alt}
                    className={cn(
                      "-mt-3 h-24 w-auto shrink-0 [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.22))_drop-shadow(0_10px_14px_rgba(0,0,0,0.28))] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:rotate-0 sm:h-28",
                      i % 2 ? "rotate-[5deg]" : "-rotate-[4deg]",
                    )}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
