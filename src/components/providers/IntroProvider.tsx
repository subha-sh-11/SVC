"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { LOCKUP_POSTERS, SvcLockup, FULL_NAME, type LockupStage } from "@/components/brand/SvcLockup";
import { posterWall, titleLogos, type PosterTile } from "@/data/posters";
import { useLenis } from "./SmoothScroll";

const IntroContext = createContext(true);

/** True once the opening title sequence has cleared the screen. */
export function useIntroDone() {
  return useContext(IntroContext);
}

const TAGLINE = "Stories since 2003";
const EASE = [0.22, 1, 0.36, 1] as const;
const DARK = "#1c0d05"; // lamp-lit umber

// Opening sequence (ms from start).
const FRAME_MS = 120; // one official title logo per frame
const T_ASSEMBLE = 2900; // logos end; the screen turns white and the posters fly in to build "SVC"
const T_CRISP = 5600; // the letters turn full gold
const T_BRAND = 6100; // god symbol and name
const T_EXIT = 9600; // the opening dissolves into the home hero, which shows the same lockup

type Mode = "full" | "short";
type Phase = "load" | "flicker" | "assemble" | "crisp" | "brand";
const ORDER: Phase[] = ["load", "flicker", "assemble", "crisp", "brand"];
const atLeast = (p: Phase, q: Phase) => ORDER.indexOf(p) >= ORDER.indexOf(q);
const STAGE: Record<Phase, LockupStage> = { load: "hidden", flicker: "hidden", assemble: "assemble", crisp: "crisp", brand: "brand" };

/** Titles shown in the flicker: films with an official title logo, spread across the catalogue in release order. */
const FLICKER: PosterTile[] = (() => {
  const withLogo = posterWall.filter((t) => titleLogos[t.slug]);
  const pool = withLogo.length ? withLogo : posterWall;
  const frames = Math.min(Math.floor(T_ASSEMBLE / FRAME_MS), pool.length);
  return Array.from({ length: frames }, (_, i) => pool[Math.round((i * (pool.length - 1)) / Math.max(frames - 1, 1))]);
})();

function preload(srcs: string[], timeout: number) {
  return new Promise<void>((resolve) => {
    let left = srcs.length;
    if (!left) return resolve();
    const t = window.setTimeout(resolve, timeout);
    const one = () => {
      if (--left === 0) {
        window.clearTimeout(t);
        resolve();
      }
    };
    srcs.forEach((src) => {
      const img = new window.Image();
      img.onload = img.onerror = one;
      img.src = src;
    });
  });
}

/** Emblem + full name on one line, gold ornament, tagline: the short opening (reduced motion). */
function BrandLockup() {
  return (
    <div className="relative flex w-full flex-col items-center px-4 text-center">
      <div className="relative flex items-center gap-[0.45em] text-[clamp(1.05rem,5.2vw,4.6rem)] whitespace-nowrap">
        <div className="pointer-events-none absolute -inset-x-[2em] -inset-y-[2.2em] bg-[radial-gradient(closest-side,rgba(232,181,58,0.24),rgba(232,181,58,0.07)_55%,transparent)]" />
        <Image src="/brand/svc-deity.png" alt="" width={606} height={906} loading="eager" className="relative h-[1.7em] w-auto shrink-0" />
        <p className="display relative pt-[0.06em] pb-[0.14em] text-ink">{FULL_NAME}</p>
      </div>
      <div className="mt-6 flex w-64 items-center gap-3 sm:w-96">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-deep" />
        <span className="h-2 w-2 rotate-45 bg-gold" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-deep" />
      </div>
      <p className="mt-5 text-[max(0.66rem,9px)] font-semibold tracking-[0.42em] text-ink-700 uppercase sm:text-xs">{TAGLINE}</p>
    </div>
  );
}

/** The full opening: official title logos, posters flying in to build "SVC", then the god symbol and name. */
function FullIntro({ phase, frame }: { phase: Phase; frame: number }) {
  const flick = FLICKER[Math.min(frame, FLICKER.length - 1)]; // ends on the newest film
  const logo = titleLogos[flick.slug];
  const light = atLeast(phase, "assemble");

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: light ? "#ffffff" : DARK, transition: light ? "background-color 1.5s ease" : "none" }}>
      {/* The lockup, laid out exactly where the home hero shows it */}
      <div className="absolute inset-x-0 top-0 flex h-[100svh] min-h-[560px] items-center justify-center px-4">
        <SvcLockup stage={STAGE[phase]} />
      </div>

      {/* While the posters load: the emblem, glowing softly */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "load" ? 1 : 0 }}
        transition={{ duration: phase === "load" ? 0.6 : 0.15 }}
      >
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.75, 1, 0.75] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <Image src="/brand/svc-deity.png" alt="" width={606} height={906} loading="eager" className="h-24 w-auto drop-shadow-[0_0_30px_rgba(232,181,58,0.45)]" />
        </motion.div>
      </motion.div>

      {/* Title flicker: each film's official title logo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[22px] px-6 text-center" style={{ opacity: phase === "flicker" ? 1 : 0 }}>
        <div className="flex min-h-[1.9em] max-w-[min(92vw,1300px)] items-center justify-center text-[clamp(56px,10.5vw,176px)]" style={{ transform: frame % 2 ? "scale(1.04)" : "scale(1)" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- frames swap every 120 ms; preloaded
            <img src={logo} alt="" className="h-[min(40vh,380px)] w-[min(80vw,900px)] object-contain [filter:drop-shadow(0_0_26px_rgba(255,236,210,0.28))]" />
          ) : (
            <span className="font-title leading-[0.95] text-balance text-[#f4efe6] uppercase">{flick.title}</span>
          )}
        </div>
        <span className="text-[15px] font-medium tracking-[0.3em] text-[#b8ae9f] tabular-nums">{flick.year}</span>
      </div>
    </div>
  );
}

export function IntroProvider({ children }: { children: ReactNode }) {
  // null until the client decides which version to play, so animations start with the right timing.
  const [mode, setMode] = useState<Mode | null>(null);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<Phase>("load");
  const [frame, setFrame] = useState(0);
  const lenis = useLenis();
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setVisible(false);
    window.setTimeout(() => setDone(true), 350);
  }, []);

  // The full opening plays on every page load (the provider lives in the layout, so moving between
  // pages inside the site does not replay it). Visitors who ask for reduced motion get the lockup alone.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(reduced ? "short" : "full");
  }, []);

  // Short version (reduced motion): the lockup alone.
  useEffect(() => {
    if (mode !== "short") return;
    const t = window.setTimeout(finish, 1300);
    return () => window.clearTimeout(t);
  }, [mode, finish]);

  // Full version: wait (briefly) for the logos and posters, then run the sequence.
  useEffect(() => {
    if (mode !== "full") return;
    let cancelled = false;
    let interval = 0;
    const timers: number[] = [];
    // The title logos, the posters and the title typeface, so nothing pops in late
    // (capped so a slow network still gets the intro).
    const srcs = [...FLICKER.map((t) => titleLogos[t.slug]).filter((s): s is string => Boolean(s)), ...LOCKUP_POSTERS];
    // next/font registers the face under a generated family name, exposed through --font-anton.
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-anton").trim();
    const font = family && document.fonts ? document.fonts.load(`1em ${family}`).catch(() => undefined) : Promise.resolve();
    Promise.all([preload(Array.from(new Set(srcs)), 2500), Promise.race([font, new Promise((r) => window.setTimeout(r, 2500))])]).then(() => {
      if (cancelled) return;
      setPhase("flicker");
      interval = window.setInterval(() => setFrame((f) => f + 1), FRAME_MS);
      const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
      at(T_ASSEMBLE, () => {
        window.clearInterval(interval);
        setPhase("assemble");
      });
      at(T_CRISP, () => setPhase("crisp"));
      at(T_BRAND, () => setPhase("brand"));
      at(T_EXIT, finish);
    });
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [mode, finish]);

  useEffect(() => {
    if (!lenis) return;
    if (visible) lenis.stop();
    else lenis.start();
  }, [visible, lenis]);

  return (
    <IntroContext.Provider value={done}>
      {children}
      <AnimatePresence>
        {visible && (
          // No curtains: the opening dissolves. On the home page the hero underneath shows the same lockup in the
          // same place, so the animation simply becomes the hero.
          <motion.div
            key="intro"
            className="fixed inset-0 z-[100] bg-white"
            aria-hidden="true"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            {mode === "full" && <FullIntro phase={phase} frame={frame} />}
            {mode === "short" && (
              <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                <BrandLockup />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip, outside the aria-hidden overlay so it stays reachable */}
      <AnimatePresence>
        {visible && mode === "full" && (
          <motion.button
            type="button"
            onClick={finish}
            className="fixed right-6 bottom-5 z-[101] inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] backdrop-blur-sm transition-colors"
            style={
              atLeast(phase, "assemble")
                ? { color: "#6e655b", borderColor: "#d8cfc2", background: "rgba(255,255,255,0.6)" }
                : { color: "#f4efe6", borderColor: "rgba(244,239,230,0.35)", background: "rgba(22,19,15,0.55)" }
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Skip intro
          </motion.button>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
