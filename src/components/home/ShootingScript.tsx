"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { ArrowIcon } from "@/components/ui/Buttons";

const EASE = [0.22, 1, 0.36, 1] as const;
const INK = "#1f1a17";

/** Binder tabs along the top of the script page. */
const TABS = [
  { href: "/films", label: "Films", color: "#a9c4e6" },
  { href: "/production", label: "Production", color: "#ecb3c3" },
  { href: "/awards", label: "Awards", color: "#ecd87c" },
  { href: "/upcoming", label: "Upcoming", color: "#a8d5a0" },
  { href: "/media", label: "Media", color: "#e3b443" },
  { href: "/about", label: "About", color: "#e8d9bb" },
];

const HEADING = ["Every film", "starts on", "page one."];
const TYPE_STEP = 0.045;

/** The heading types itself out, ending on a blinking cursor. */
function TypedHeading({ play }: { play: boolean }) {
  let n = 0;
  return (
    <h2
      aria-label={HEADING.join(" ")}
      className="mt-6 font-script text-[clamp(2.5rem,4.8vw,5.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-ivory [text-shadow:0_2px_18px_rgba(90,30,0,0.35)]"
    >
      {HEADING.map((line, li) => (
        <span key={line} className="block whitespace-nowrap" aria-hidden="true">
          {line.split("").map((ch, i) => {
            const k = n++;
            return (
              <motion.span key={i} initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={{ delay: 0.25 + k * TYPE_STEP, duration: 0.01 }}>
                {ch === " " ? " " : ch}
              </motion.span>
            );
          })}
          {li === HEADING.length - 1 && (
            <motion.span
              className="ml-[0.08em] inline-block h-[0.82em] w-[0.09em] translate-y-[0.1em] bg-turmeric"
              initial={{ opacity: 0 }}
              animate={play ? { opacity: [0, 1, 1, 0] } : {}}
              transition={{ delay: 0.25, duration: 1.05, repeat: Infinity, times: [0, 0.05, 0.55, 0.6] }}
            />
          )}
        </span>
      ))}
    </h2>
  );
}

/** A film title in the script that links to its page. */
function FilmRef({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link href={`/films/${slug}`} className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-300 hover:text-vermilion hover:decoration-vermilion">
      {children}
    </Link>
  );
}

/** Red pen circle drawn around a word. */
function Circled({ children, play, delay }: { children: ReactNode; play: boolean; delay: number }) {
  return (
    <span className="relative inline-block px-[0.35em]">
      {children}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute -top-[0.3em] -left-[0.15em] h-[calc(100%+0.6em)] w-[calc(100%+0.3em)] overflow-visible" aria-hidden="true">
        <motion.path
          d="M10,24 C6,9 40,3 64,5 C88,7 98,15 95,25 C92,35 60,38 36,36 C14,34 3,27 8,16 C11,11 17,9 24,8"
          fill="none"
          stroke="var(--color-vermilion)"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={play ? { pathLength: 1 } : {}}
          transition={{ delay, duration: 0.9, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}

/** A line of the script, revealed in reading order. */
function Beat({ i, play, children, className }: { i: number; play: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 8 }} animate={play ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 + i * 0.16, duration: 0.6, ease: EASE }}>
      {children}
    </motion.div>
  );
}

export function ShootingScript() {
  const ref = useRef<HTMLElement>(null);
  const play = useInView(ref, { once: true, amount: 0.3 });
  const typeEnd = 0.25 + HEADING.join("").length * TYPE_STEP;

  const montage = [
    <Fragment key="m1">
      Sukumar directs his first film, <FilmRef slug="arya-2004">ARYA</FilmRef>.
    </Fragment>,
    <Fragment key="m2">
      <FilmRef slug="bommarillu-2006">BOMMARILLU</FilmRef>. <FilmRef slug="kotha-bangaru-lokam-2008">KOTHA BANGARU LOKAM</FilmRef>. <FilmRef slug="fidaa-2017">FIDAA</FilmRef>.{" "}
      <FilmRef slug="f2-fun-and-frustration-2019">F2</FilmRef>.
    </Fragment>,
    <Fragment key="m3">
      National Film Awards for <FilmRef slug="shatamanam-bhavati-2017">SHATAMANAM BHAVATI</FilmRef> and <FilmRef slug="maharshi-2019">MAHARSHI</FilmRef>.
    </Fragment>,
    <Fragment key="m4">Sankranthi after Sankranthi, a new SVC release.</Fragment>,
  ];

  return (
    <section
      ref={ref}
      id="script"
      data-header-theme="dark"
      className="relative overflow-hidden bg-[linear-gradient(128deg,#6e2504_0%,#a63f0a_38%,#d0600f_72%,#e57a1c_100%)] pt-32 pb-24 text-ivory sm:pt-36 sm:pb-28"
    >
      {/* Lamp light: a turmeric glow behind the script page, a sindoor warmth low on the left */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_65%_at_74%_46%,rgba(242,194,48,0.42),transparent_70%),radial-gradient(45%_60%_at_8%_100%,rgba(184,36,26,0.35),transparent_70%)]"
        aria-hidden="true"
      />
      {/* Kolam dots, fading away from the edges */}
      <div className="kolam-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(75%_80%_at_30%_50%,#000,transparent_80%)]" aria-hidden="true" />
      {/* Thoranam across the top, as over a doorway: an auspicious start */}
      <div className="toran pointer-events-none absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="shell relative grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        {/* ------------------------------------------------ Copy */}
        <div className="min-w-0 lg:col-span-5">
          <motion.p
            className="font-script text-[0.8rem] tracking-[0.2em] text-[#ffe3a6] uppercase sm:text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            Shooting script · Since 2003
          </motion.p>

          <TypedHeading play={play} />

          <motion.p
            className="mt-8 max-w-md text-lg leading-relaxed text-ivory/90"
            initial={{ opacity: 0, y: 12 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: typeEnd, duration: 0.8, ease: EASE }}
          >
            Two decades of Telugu cinema from Sri Venkateswara Creations: the films, the filmmakers, and the scenes still being written.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: typeEnd + 0.2, duration: 0.8, ease: EASE }}
          >
            <Link
              href="/films"
              className="group inline-flex items-center gap-3 bg-ivory px-7 py-4 font-script text-[0.95rem] font-bold text-shade transition-colors duration-300 hover:bg-white"
            >
              Explore Our Films
              <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/production"
              className="inline-flex items-center border border-ivory/55 px-7 py-4 font-script text-[0.95rem] font-bold text-ivory transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
            >
              Discover Our Journey
            </Link>
          </motion.div>
        </div>

        {/* ------------------------------------------------ Script page */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-6 xl:col-start-7">
          {/* Binder tabs */}
          <nav aria-label="Sections" className="no-scrollbar relative -mb-1 flex gap-1 overflow-x-auto px-[4%] pt-2 sm:gap-1.5">
            {TABS.map((t, i) => (
              <motion.div
                key={t.href}
                className="shrink-0"
                initial={{ opacity: 0, y: 24 }}
                animate={play ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.6, ease: EASE }}
              >
                <Link
                  href={t.href}
                  style={{ backgroundColor: t.color, color: INK }}
                  className="block rounded-t-[7px] px-3.5 pt-2.5 pb-3.5 font-script text-[0.82rem] font-bold transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 sm:px-5 sm:text-[0.95rem]"
                >
                  {t.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.article
            aria-label="SVC, as a screenplay"
            className="relative z-10 bg-[#fbf9f4] pt-14 pr-[7%] pb-12 pl-[9%] font-script text-[clamp(0.8rem,1.02vw,1.12rem)] leading-[1.8] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)] sm:pl-[10%]"
            style={{ color: INK }}
            initial={{ opacity: 0, y: 40, rotate: 1.2 }}
            animate={play ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ duration: 1, ease: EASE }}
          >
            <span className="absolute top-6 right-[5%]">1.</span>

            <Beat i={0} play={play}>
              FADE IN:
            </Beat>

            <Beat i={1} play={play} className="mt-6">
              <p className="font-bold">EXT. NIZAM — 1999</p>
              <p className="mt-2">A distribution business opens: Sri Venkateswara Film Distributors. Early releases include OKE OKKADU and SAKHI.</p>
            </Beat>

            <Beat i={2} play={play} className="relative mt-6">
              <p className="font-bold">INT. CINEMA HALL — APRIL 2003</p>
              <p className="relative mt-2">
                The lights go down. The banner&rsquo;s first production rolls:{" "}
                <span className="whitespace-nowrap">
                  <Circled play={play} delay={1.5}>
                    <FilmRef slug="dil-2003">DIL</FilmRef>
                  </Circled>
                  .
                </span>
                <motion.span
                  className="pointer-events-none absolute -top-[1.1em] right-0 rotate-[-5deg] font-hand text-[1.55em] font-semibold whitespace-nowrap text-vermilion"
                  initial={{ opacity: 0, y: 6 }}
                  animate={play ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 2.2, duration: 0.6, ease: EASE }}
                  aria-hidden="true"
                >
                  where it began
                </motion.span>
              </p>
            </Beat>

            <Beat i={3} play={play} className="mt-6">
              <p className="font-bold">MONTAGE — 2004 TO 2025</p>
              <ul className="mt-2 space-y-1">
                {montage.map((line, i) => (
                  <li key={i} className="grid grid-cols-[1.6em_1fr]">
                    <span aria-hidden="true">—</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Beat>

            <Beat i={4} play={play} className="mt-6 text-right">
              CUT TO:
            </Beat>

            <Beat i={5} play={play} className="mt-6">
              <p className="font-bold">EXT. HYDERABAD — NOW</p>
              <p className="mt-2">The next scene is already being shot.</p>
            </Beat>

            <motion.div
              className="mt-4 flex justify-end"
              initial={{ opacity: 0, y: 6 }}
              animate={play ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2.6, duration: 0.6, ease: EASE }}
            >
              <Link href="/upcoming" className="group inline-flex rotate-[-4deg] items-center gap-2 font-hand text-[1.65em] leading-none font-semibold text-vermilion">
                see what&rsquo;s next
                <svg viewBox="0 0 48 16" className="h-[0.6em] w-[1.6em] overflow-visible transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  <motion.path
                    d="M2,9 C14,7 28,8 44,8 M36,3 L45,8 L37,13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={play ? { pathLength: 1 } : {}}
                    transition={{ delay: 2.9, duration: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </Link>
            </motion.div>

            <Beat i={6} play={play} className="mt-3 text-right">
              (CONTINUED)
            </Beat>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
