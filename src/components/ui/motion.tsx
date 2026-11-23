"use client";

import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/* Reveal: fades and lifts content into place when it enters the viewport.    */
/* -------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
  as = "div",
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "p" | "span" | "header";
  amount?: number;
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/* SplitWords: each word rises from behind a mask, staggered.                 */
/* -------------------------------------------------------------------------- */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  as = "span",
  trigger,
  italicWords = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: ElementType;
  /** When provided, animation is driven by this flag instead of viewport entry. */
  trigger?: boolean;
  italicWords?: string[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const show = trigger ?? inView;
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        // Italic words lean past their box: pad them so the last letter isn't clipped.
        <span key={i} aria-hidden="true" className={cn("inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]", italicWords.includes(w) && "-mr-[0.16em]")}>
          <motion.span
            className={cn("inline-block will-change-transform", italicWords.includes(w) && "pr-[0.16em] italic text-gold-gradient")}
            initial={{ y: "115%", rotate: 4 }}
            animate={show ? { y: "0%", rotate: 0 } : { y: "115%", rotate: 4 }}
            transition={{ duration: 1.05, delay: delay + i * stagger, ease: EASE }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrollText: paragraph whose words light up as it scrolls through view.     */
/* -------------------------------------------------------------------------- */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span aria-hidden="true" className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Counter: counts up to a value once visible.                                */
/* -------------------------------------------------------------------------- */
export function Counter({ to, from = 0, suffix = "", className, duration = 2.2 }: { to: number; from?: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(from, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, from, to, duration, reduce]);
  return (
    <span ref={ref} className={className} aria-label={`${to}${suffix}`}>
      {value}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax: translates its child against scroll for depth.                   */
/* -------------------------------------------------------------------------- */
export function Parallax({ children, className, offset = 80 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-12%_0]">
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrollProgressBar: thin gold bar showing reading progress for the page.    */
/* -------------------------------------------------------------------------- */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-gold-deep via-gold-bright to-gold" />;
}

/* -------------------------------------------------------------------------- */
/* Velocity marquee: scrolls continuously, speeding up with page scroll.     */
/* -------------------------------------------------------------------------- */
export function Marquee({ children, speed = 2.2, className, reverse = false }: { children: ReactNode; /** % of one copy per second */ speed?: number; className?: string; reverse?: boolean }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [-1500, 0, 1500], [5, 0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = reverse ? 1 : -1;

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const step = dir * (speed / 2) * (delta / 1000);
    baseX.set(baseX.get() + step + step * Math.abs(boost.get()));
  });

  return (
    <div className={cn("relative flex overflow-hidden mask-fade-x", className)}>
      <motion.div className="flex shrink-0 whitespace-nowrap will-change-transform" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}
