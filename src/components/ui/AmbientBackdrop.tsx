"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type BackdropSources = {
  /** Starts at once: 1080p on desktops, 720p on phones and slow or data-saving connections. */
  first: string;
  /** Loaded behind the first once it plays, on screens with the pixels for it; takes over in step. */
  uhd?: string;
};

type Connection = { saveData?: boolean; effectiveType?: string };
export function slowConnection() {
  const conn = (navigator as Navigator & { connection?: Connection }).connection;
  return Boolean(conn?.saveData) || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
}
/** The screen's real width in pixels. */
export const screenPixels = () => window.screen.width * (window.devicePixelRatio || 1);

/** The ambient glow: a tiny copy of the frame, redrawn a few times a second and blurred wide. */
const GLOW = { w: 24, h: 14, everyMs: 140 };

/**
 * A film behind the top of a page, in "ambient" style: the picture plays across the top (its
 * lower edge feathered away), its colours spread out around and below it in a soft glow, and the
 * glow fades into the white page. A still shows at once; the film starts as soon as it can; on
 * screens that can show it, a sharper version loads behind and takes over in step, so nothing
 * stalls. All of it pauses when scrolled away; with reduced motion it is the still alone.
 */
export function AmbientBackdrop({
  pick,
  poster,
  focus = "50% 40%",
  videoHeight = "h-[70svh] min-h-[480px]",
  shade = 0.45,
}: {
  /** Chooses the films for this screen (runs in the browser). */
  pick: () => BackdropSources;
  poster: string;
  focus?: string;
  videoHeight?: string;
  /** How dark the left side gets behind the title (0 to 1). */
  shade?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLVideoElement>(null);
  const uhd = useRef<HTMLVideoElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const onScreen = useInView(ref, { amount: 0.02 });
  const reduce = useReducedMotion();
  const [src, setSrc] = useState<BackdropSources>();
  const [stillOk, setStillOk] = useState(true);
  const [firstOn, setFirstOn] = useState(false);
  const [uhdReady, setUhdReady] = useState(false);
  const [uhdOn, setUhdOn] = useState(false);

  useEffect(() => {
    if (!reduce) setSrc(pick());
  }, [reduce, pick]);

  useEffect(() => {
    const v = first.current;
    if (!v || !src) return;
    if (onScreen && !uhdOn) v.play().catch(() => undefined);
    else v.pause();
  }, [onScreen, src, uhdOn]);

  useEffect(() => {
    const v = uhd.current;
    if (!v || !uhdReady) return;
    if (!onScreen) {
      v.pause();
      return;
    }
    if (!uhdOn && first.current) v.currentTime = first.current.currentTime;
    v.play().catch(() => undefined);
  }, [uhdReady, onScreen, uhdOn]);

  // The glow follows whatever is showing: the 4K film, the first film, or the still.
  useEffect(() => {
    const ctx = glow.current?.getContext("2d");
    if (!ctx || !onScreen) return;
    let raf = 0;
    let last = -1e9;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < GLOW.everyMs) return;
      last = t;
      const v = uhdOn ? uhd.current : firstOn ? first.current : null;
      const source = v && v.readyState >= 2 ? v : still.current?.complete && still.current.naturalWidth ? still.current : null;
      if (source) ctx.drawImage(source, 0, 0, GLOW.w, GLOW.h);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onScreen, firstOn, uhdOn]);

  const fill = "absolute inset-0 h-full w-full max-w-none object-cover";
  const feather = { maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)" };

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] min-h-[680px] overflow-hidden">
      {/* The glow: the frame's colours, spread wide and soft, fading into the white page */}
      <canvas
        ref={glow}
        width={GLOW.w}
        height={GLOW.h}
        className="absolute inset-x-0 top-0 h-[92%] w-full scale-[1.3] opacity-75 [filter:blur(110px)_saturate(1.3)]"
      />
      {/* The picture, its lower edge feathered into the glow */}
      <div className={`absolute inset-x-0 top-0 ${videoHeight}`} style={feather}>
        {stillOk && (
          // eslint-disable-next-line @next/next/no-img-element -- full-bleed still, already sized
          <img ref={still} src={poster} alt="" fetchPriority="high" onError={() => setStillOk(false)} className={fill} style={{ objectPosition: focus }} />
        )}
        {src && (
          <motion.video
            ref={first}
            src={src.first}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onPlaying={() => setFirstOn(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: firstOn ? 1 : 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={fill}
            style={{ objectPosition: focus }}
          />
        )}
        {src?.uhd && firstOn && (
          <motion.video
            ref={uhd}
            src={src.uhd}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={() => setUhdReady(true)}
            onPlaying={() => setUhdOn(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: uhdOn ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className={fill}
            style={{ objectPosition: focus }}
          />
        )}
        {/* A little shade at the top for the header, and at the left where the title sits */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,${shade}) 0%, rgba(0,0,0,${shade * 0.55}) 32%, rgba(0,0,0,0) 58%)` }} />
      </div>
      {/* Into white */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(255,255,255,0.75)_78%,#fff_96%)]" />
    </div>
  );
}
