"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useIntroDone } from "@/components/providers/IntroProvider";
import { useTrailer } from "@/components/providers/TrailerProvider";
import { speeches, type Speech } from "@/data/speech";
import { svcLetters } from "@/data/svcLetters";
import { HomeHero } from "./HomeHero";

/** Where v sits between a and b, as 0..1. */
const between = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const [VX, VY, VW, VH] = svcLetters.viewBox;
/** The thickest point of the V's stroke (letters' own units) and the radius of the circle that fits there. */
const FOCUS = { x: 821, y: -600, r: 105 };

// The scroll, in phases (0..1 across the pinned opening).
const FADE = [0.02, 0.12] as const; // the hero falls away, leaving SVC as windows onto the film
const GLIDE = [0.1, 0.3] as const; // SVC glides to the centre and grows a little
const DIVE = [0.3, 0.56] as const; // the camera dives through the V until the film fills the screen
const ASIDE = [0.56, 0.7] as const; // the film moves aside (right; on phones, up to its own 16:9) and the glow comes in
const WORDS = [0.66, 0.9] as const; // his words light up in the glow
/** From here he is heard (the film fills the screen). */
const SOUND_FROM = 0.5;
/** Phones: the film's top once it has moved up into its own 16:9 band. */
const BAND_TOP = 72;
/** The glow: a tiny copy of the current frame, stretched to fill (cheap, and always in step with him). */
const GLOW = { w: 48, h: 27, everyMs: 120 };

type Box = { x: number; y: number; w: number; h: number };

/** One word of his quote, lighting up in turn as the scroll passes it. */
function Word({ w, i, n, progress }: { w: string; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, (v) => 0.2 + 0.8 * between(between(v, WORDS[0], WORDS[1]) * (n + 3) - i, 0, 3));
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

/** A bar per clip: those played are full, the one playing fills as it goes. Each plays its clip. */
function ClipBars({ index, fill, go }: { index: number; fill: MotionValue<number>; go: (i: number) => void }) {
  const scaleX = useTransform(fill, (v) => Math.min(1, Math.max(0, v)));
  return (
    <ol aria-label="His speeches" className="mt-5 flex max-w-[15rem] gap-1.5">
      {speeches.map((s, i) => (
        <li key={s.key} className="min-w-0 flex-1">
          <button type="button" onClick={() => go(i)} aria-label={`Play: ${s.context}`} aria-current={i === index} className="group block w-full py-2">
            <span className="relative block h-[3px] overflow-hidden rounded-full bg-[#2a1408]/15 transition-colors group-hover:bg-[#2a1408]/30">
              {i < index && <span className="absolute inset-0 bg-[#2a1408]/45" />}
              {i === index && <motion.span className="absolute inset-0 origin-left bg-gradient-to-r from-[#e8731a] to-[#c2520e]" style={{ scaleX }} />}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/** His words (those of the clip playing), signature and the clip's controls. */
function Words({
  progress,
  clip,
  index,
  fill,
  go,
  setSoundOn,
}: {
  progress: MotionValue<number>;
  clip: Speech;
  index: number;
  fill: MotionValue<number>;
  go: (i: number) => void;
  setSoundOn: (on: boolean, chosen?: boolean) => void;
}) {
  const openTrailer = useTrailer();
  const words = useMemo(() => clip.quote.split(" "), [clip]);
  const signClip = useTransform(progress, (v) => `inset(-30% ${100 - 100 * between(v, 0.86, 0.93)}% -30% -5%)`);
  const roleOpacity = useTransform(progress, (v) => between(v, 0.91, 0.96));
  return (
    <>
      <p className="flex items-center gap-3 text-[0.66rem] font-bold tracking-[0.32em] text-saffron-deep uppercase">
        <span className="h-px w-8 bg-saffron-deep/60" aria-hidden="true" />
        In his words
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.blockquote
          key={clip.key}
          className="relative mt-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.35, ease: "easeIn" } }}
        >
          <span aria-hidden="true" className="absolute -top-7 -left-1 font-display text-7xl leading-none text-saffron/30">
            &ldquo;
          </span>
          <p className="relative font-display text-[clamp(1.1rem,1.85vw,2rem)] leading-[1.28] text-[#2a1408] italic" aria-label={clip.quote}>
            {words.map((w, i) => (
              <Word key={i} w={w} i={i} n={words.length} progress={progress} />
            ))}
          </p>
        </motion.blockquote>
      </AnimatePresence>
      <motion.p style={{ clipPath: signClip }} className="mt-4 inline-block font-hand text-[clamp(2rem,2.8vw,2.9rem)] leading-none font-semibold text-saffron-deep">
        Dil Raju
      </motion.p>
      <motion.p style={{ opacity: roleOpacity }} className="mt-1 text-[0.58rem] font-semibold tracking-[0.22em] text-[#6f4b2f] uppercase">
        Founder &amp; producer · {clip.context}
      </motion.p>
      <ClipBars index={index} fill={fill} go={go} />
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setSoundOn(false);
            openTrailer({ youtubeId: clip.videoId, title: "Dil Raju", label: clip.context, start: clip.start });
          }}
          className="rounded-full border border-[#2a1408]/25 px-4 py-2.5 text-[0.66rem] font-bold tracking-[0.14em] text-[#2a1408] uppercase transition hover:border-[#2a1408]/60"
        >
          Watch full video
        </button>
      </div>
      <p className="mt-3 text-[0.6rem] text-[#6f4b2f]/80">
        Video: {clip.uploader}
        {clip.translated ? " · translated from Telugu" : ""}
      </p>
    </>
  );
}

/**
 * The home page's opening. Scrolling, the hero falls away and leaves SVC: its letters become
 * windows onto Dil Raju speaking, glide to the centre, and the camera dives through the V until
 * he fills the screen. Then the film moves aside (to the right; on phones, up into its own 16:9
 * band) and an ambient glow of the film itself comes in, with his words on it.
 */
export function HomeOpening() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // The clips, one after another: the one playing, the one fading out over it, and the next, loading underneath.
  const videos = useRef(new Map<number, HTMLVideoElement>());
  const [{ clip, prev }, setClips] = useState<{ clip: number; prev: number | null }>({ clip: 0, prev: null });
  const clipRef = useRef(0);
  clipRef.current = clip;
  const next = (clip + 1) % speeches.length;
  const [loadNext, setLoadNext] = useState(false);
  const fill = useMotionValue(0);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const lettersRef = useRef<SVGGElement>(null);
  const rimRef = useRef<SVGGElement>(null);
  const maskId = useId();
  const reduce = useReducedMotion();
  const introDone = useIntroDone();
  const onScreen = useInView(stageRef, { amount: 0.25 });
  const [mounted, setMounted] = useState(false);
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  const [box, setBox] = useState<Box | null>(null);
  const wide = vp.w >= 768;
  const { scrollYProgress: scroll } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const p = reduce ? still : scroll;

  useEffect(() => setMounted(true), []);

  // Where the hero's poster letters sit in the stage: the windows start exactly over them.
  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current?.getBoundingClientRect();
      const el = heroRef.current?.querySelector("[data-svc-letters]")?.getBoundingClientRect();
      if (stage) setVp({ w: stage.width, h: stage.height });
      if (!stage || !el) return;
      setBox({ x: el.left - stage.left, y: el.top - stage.top, w: el.width, h: el.height });
    };
    measure();
    const late = [300, 1200].map((d) => window.setTimeout(measure, d));
    window.addEventListener("resize", measure);
    return () => {
      late.forEach(window.clearTimeout);
      window.removeEventListener("resize", measure);
    };
  }, [introDone]);

  // The letters' transform for a point in the scroll: start over the hero's letters, glide to
  // the centre, then dive into the V (scale grows geometrically, so the zoom feels even).
  const place = useCallback(
    (v: number) => {
      if (!box) return null;
      const s0 = box.w / VW;
      const p0 = { x: box.x + (FOCUS.x - VX) * s0, y: box.y + (FOCUS.y - VY) * s0 };
      const s1 = s0 * Math.min(1.12, (0.9 * vp.w) / box.w);
      const p1 = { x: vp.w / 2 + (FOCUS.x - (VX + VW / 2)) * s1, y: vp.h / 2 + (FOCUS.y - (VY + VH / 2)) * s1 };
      const s2 = (1.25 * Math.hypot(vp.w, vp.h)) / 2 / FOCUS.r;
      const g = easeInOut(between(v, GLIDE[0], GLIDE[1]));
      const d = easeIn(between(v, DIVE[0], DIVE[1]));
      const s = lerp(s0, s1, g) * Math.pow(s2 / s1, d);
      const x = lerp(lerp(p0.x, p1.x, g), vp.w / 2, d);
      const y = lerp(lerp(p0.y, p1.y, g), vp.h / 2, d);
      return `translate(${x} ${y}) scale(${s}) translate(${-FOCUS.x} ${-FOCUS.y})`;
    },
    [box, vp],
  );
  const apply = useCallback(
    (v: number) => {
      const t = place(v);
      if (!t) return;
      lettersRef.current?.setAttribute("transform", t);
      rimRef.current?.setAttribute("transform", t);
    },
    [place],
  );
  useMotionValueEvent(scroll, "change", apply);
  // The corner logo reads what is behind it: the film, dark, from when it fills the screen until
  // it moves aside into the glow.
  useMotionValueEvent(p, "change", (v) => stageRef.current?.setAttribute("data-header-theme", v > DIVE[1] - 0.07 && v < ASIDE[0] + 0.05 ? "dark" : "light"));
  useEffect(() => apply(scroll.get()), [apply, scroll]);

  // Plain functions rather than range maps: they hold their end values after the pin.
  // Layers that are done are hidden outright, so the phone only draws the film.
  const heroOpacity = useTransform(p, (v) => 1 - between(v, FADE[0], FADE[1]));
  const heroVisibility = useTransform(p, (v) => (v > FADE[1] ? "hidden" : "visible"));
  const heroEvents = useTransform(p, (v) => (v > FADE[0] ? "none" : "auto"));
  const sheetOpacity = useTransform(p, (v) => 1 - between(v, DIVE[1] - 0.06, DIVE[1]));
  const sheetVisibility = useTransform(p, (v) => (v >= DIVE[1] ? "hidden" : "visible"));
  const rimOpacity = useTransform(p, (v) => between(v, FADE[0], FADE[1]) * (1 - between(v, DIVE[0], DIVE[0] + 0.1)));

  // The film is laid out at its own 16:9, just covering the screen (never cropped by the
  // browser, so on phones it can shrink to show the whole frame, sharp).
  const coverW = Math.max(vp.w, (vp.h * 16) / 9);
  const coverH = (coverW * 9) / 16;
  const bandScale = vp.w / coverW;
  const aside = (v: number) => easeInOut(between(v, ASIDE[0], ASIDE[1]));
  const settle = (v: number) => 1.15 - 0.15 * easeInOut(between(v, GLIDE[0], DIVE[1]));
  const filmScale = useTransform(p, (v) => (wide ? settle(v) : lerp(settle(v), bandScale, aside(v))));
  const filmX = useTransform(p, (v) => (wide ? 0.14 * vp.w * aside(v) : 0));
  const filmY = useTransform(p, (v) => (wide ? 0 : (BAND_TOP + (vp.w * 9) / 16 / 2 - vp.h / 2) * aside(v)));
  const filmRadius = useTransform(p, (v) => (wide ? 0 : (14 / bandScale) * aside(v)));
  const glowOpacity = useTransform(p, (v) => between(v, ASIDE[0], ASIDE[1] - 0.04));
  const wordsOpacity = useTransform(p, (v) => between(v, ASIDE[0] + 0.07, ASIDE[1] + 0.02));
  const wordsRise = useTransform(p, (v) => 28 * (1 - easeInOut(between(v, ASIDE[0] + 0.07, WORDS[0] + 0.04))));
  const wordsEvents = useTransform(p, (v) => (v > ASIDE[0] + 0.08 ? "auto" : "none"));

  // ---- The film: loads at once, plays while the opening is on screen; his voice comes in on its own
  // (browsers allow sound once the visitor has clicked, tapped or pressed a key on the page). ----
  const [soundOn, setSound] = useState(false);
  const chosen = useRef(false); // the visitor's own choice (the sound button) wins
  const setSoundOn = useCallback((on: boolean, choice = false) => {
    if (choice) chosen.current = true;
    setSound(on);
  }, []);
  const live = mounted && introDone && onScreen;
  const [inSoundZone, setInSoundZone] = useState(false);
  useMotionValueEvent(scroll, "change", (v) => setInSoundZone(v > SOUND_FROM));
  const hearable = live && (inSoundZone || Boolean(reduce));
  const [blocked, setBlocked] = useState(false);

  const go = useCallback(
    (i: number) =>
      setClips((c) => {
        const k = ((i % speeches.length) + speeches.length) % speeches.length;
        return k === c.clip ? c : { clip: k, prev: c.clip };
      }),
    [],
  );
  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(() => setClips((c) => ({ ...c, prev: null })), 1000);
    return () => window.clearTimeout(t);
  }, [prev, clip]);
  useEffect(() => fill.set(0), [clip, fill]);
  useEffect(() => {
    if (!hearable) setSound(false);
    else if (!chosen.current) setSound(true);
  }, [hearable]);
  // Browsers allow sound only after the visitor has clicked or tapped the page: if it is
  // refused, carry on muted and bring the sound in at their next tap.
  // Play the clip whose turn it is (from the top when it comes round again) and keep the others quiet.
  const shownClip = useRef(-1);
  useEffect(() => {
    const cur = videos.current.get(clip);
    videos.current.forEach((v, i) => {
      if (i === clip) return;
      v.muted = true;
      if (i !== prev) v.pause();
    });
    if (!cur) return;
    if (shownClip.current !== clip) {
      shownClip.current = clip;
      if (cur.currentTime > 0.05) cur.currentTime = 0;
    }
    if (!live) {
      cur.pause();
      return;
    }
    cur.muted = !soundOn;
    cur.play().catch(() => {
      if (cur.muted) return;
      cur.muted = true;
      cur.play().catch(() => undefined);
      setSound(false);
      setBlocked(true);
    });
  }, [clip, prev, live, soundOn, mounted, wide]);
  useEffect(() => {
    if (!blocked || !hearable) return;
    const retry = () => {
      setBlocked(false);
      if (!chosen.current) setSound(true);
    };
    // Any of the gestures a browser accepts as permission for sound.
    const gestures = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    const opts = { once: true, capture: true } as const;
    gestures.forEach((g) => window.addEventListener(g, retry, opts));
    return () => gestures.forEach((g) => window.removeEventListener(g, retry, opts));
  }, [blocked, hearable]);

  // The glow: a few times a second, the current frame drawn tiny and soft, then stretched.
  useEffect(() => {
    if (!live) return;
    const ctx = glowRef.current?.getContext("2d");
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      const video = videos.current.get(clipRef.current);
      if (!video) return;
      if (video.duration) fill.set(video.currentTime / video.duration);
      if (!ctx || t - last < GLOW.everyMs || video.readyState < 2) return;
      last = t;
      ctx.filter = "blur(2px) saturate(1.5)";
      ctx.drawImage(video, -3, -3, GLOW.w + 6, GLOW.h + 6);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [live, fill]);

  if (!speeches.length) return <HomeHero />;

  const roleOf = (i: number) => (i === clip ? "current" : i === prev ? "prev" : i === next && loadNext ? "next" : null);
  const film = (
    <motion.div
      className="absolute overflow-hidden"
      style={{ left: (vp.w - coverW) / 2, top: (vp.h - coverH) / 2, width: coverW, height: coverH, x: filmX, y: filmY, scale: filmScale, borderRadius: filmRadius }}
    >
      {speeches.map((s, i) => {
        const role = roleOf(i);
        if (!role) return null;
        return (
          <motion.video
            key={s.key}
            ref={(el: HTMLVideoElement | null) => {
              if (el) videos.current.set(i, el);
              else videos.current.delete(i);
            }}
            // max-w-none: the base styles cap videos at their container's width, which would crop it.
            className="absolute inset-0 h-full w-full max-w-none object-cover"
            style={{ zIndex: role === "prev" ? 2 : role === "current" ? 1 : 0 }}
            initial={false}
            animate={{ opacity: role === "prev" ? 0 : 1 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            src={mounted ? (wide ? s.hd : s.sd) : undefined}
            poster={s.poster}
            muted
            playsInline
            preload="auto"
            // The next clip starts loading once this one is well under way.
            onPlaying={() => i === clipRef.current && window.setTimeout(() => setLoadNext(true), 4000)}
            onEnded={() => i === clipRef.current && go(i + 1)}
            aria-label={`Dil Raju speaking: ${s.quote}`}
          />
        );
      })}
    </motion.div>
  );
  // The glow sits over the film's left side on wide screens (fading out towards him), and
  // behind the film on phones (around his band).
  const glow = (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: glowOpacity,
        ...(wide
          ? { maskImage: "linear-gradient(90deg,#000 0%,#000 30%,transparent 54%)", WebkitMaskImage: "linear-gradient(90deg,#000 0%,#000 30%,transparent 54%)" }
          : {}),
      }}
    >
      <canvas ref={glowRef} width={GLOW.w} height={GLOW.h} className="absolute inset-0 h-full w-full" />
      <div
        className={
          wide
            ? "absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,242,0.72),rgba(255,246,234,0.5)_40%,rgba(255,240,222,0.15))]"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,238,0.45),rgba(255,248,238,0.82)_45%,rgba(255,248,238,0.92))]"
        }
      />
    </motion.div>
  );
  const words = (
    <motion.div
      className={wide ? "absolute top-1/2 left-[max(1.5rem,5vw)] w-[min(34vw,560px)] -translate-y-1/2" : "absolute inset-x-5"}
      style={{ ...(wide ? {} : { top: BAND_TOP + (vp.w * 9) / 16 + 28 }), opacity: wordsOpacity, y: wordsRise, pointerEvents: wordsEvents }}
    >
      <Words progress={p} clip={speeches[clip]} index={clip} fill={fill} go={go} setSoundOn={setSoundOn} />
    </motion.div>
  );

  if (reduce) {
    return (
      <>
        <div className="relative h-[100svh] min-h-[560px]">
          <HomeHero />
        </div>
        <div ref={stageRef} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#fffdf9]">
          {!wide && glow}
          {film}
          {wide && glow}
          {words}
        </div>
      </>
    );
  }

  return (
    <div ref={ref} className="relative h-[380svh]">
      <div ref={stageRef} className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden bg-[#fffdf9]">
        {/* The film, under everything (with its glow behind it on phones) */}
        {!wide && glow}
        {film}
        {wide && glow}

        {/* A white sheet with SVC cut out of it: windows onto the film */}
        <motion.svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${vp.w} ${vp.h}`}
          preserveAspectRatio="none"
          style={{ opacity: sheetOpacity, visibility: sheetVisibility }}
          aria-hidden="true"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={vp.w} height={vp.h}>
              <rect width={vp.w} height={vp.h} fill="white" />
              <g ref={lettersRef}>
                <path d={svcLetters.d} fill="black" />
              </g>
            </mask>
          </defs>
          <rect width={vp.w} height={vp.h} fill="#fffdf9" mask={`url(#${maskId})`} />
          {/* A gold rim round the letters while they glide */}
          <motion.g ref={rimRef} style={{ opacity: rimOpacity }}>
            <path d={svcLetters.d} fill="none" stroke="#e8b53a" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </motion.g>
        </motion.svg>

        {/* The hero, falling away to leave SVC behind */}
        <motion.div ref={heroRef} className="absolute inset-0" style={{ opacity: heroOpacity, visibility: heroVisibility, pointerEvents: heroEvents }}>
          <HomeHero />
        </motion.div>

        {/* His words, in the glow */}
        {words}
      </div>
      {/* Where the scroll cue takes you: Dil Raju, speaking. */}
      <div id="the-banner" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[100svh]" />
    </div>
  );
}
