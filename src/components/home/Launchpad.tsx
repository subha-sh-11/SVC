"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState, type MouseEvent } from "react";
import { Reveal } from "@/components/ui/motion";

export interface Debut {
  director: string;
  film: string;
  year: number;
  slug: string;
  image: string | null;
}

/** Directorial debuts list — hovering a name floats that film's artwork beside the cursor. */
export function Launchpad({ debuts }: { debuts: Debut[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 28, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 28, mass: 0.5 });

  const onMove = (e: MouseEvent<HTMLUListElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  const current = active !== null ? debuts[active] : null;

  return (
    <ul className="relative mt-16 border-t border-gold/15" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <AnimatePresence>
        {current?.image && (
          <motion.div
            key="float"
            className="pointer-events-none absolute top-0 left-0 z-20 hidden w-[340px] lg:block"
            style={{ x, y, translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current.slug}
                className="relative aspect-video overflow-hidden rounded-[2px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)] ring-1 ring-gold/40"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Image src={current.image} alt="" fill sizes="340px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {debuts.map((d, i) => (
        <Reveal as="li" key={d.director} delay={i * 0.05} y={24} className="border-b border-gold/15">
          <Link
            href={`/films/${d.slug}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 sm:gap-8 sm:py-7"
          >
            <span className="tabular-nums tracking-[0.06em] text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
            <span className="display text-3xl transition-all duration-500 group-hover:translate-x-3 group-hover:text-gold-bright sm:text-5xl lg:text-6xl">
              {d.director}
            </span>
            <span className="text-right">
              <span className="block text-sm text-paper/85 italic sm:text-base">{d.film}</span>
              <span className="mt-1 block tabular-nums tracking-[0.06em] text-xs text-gold">{d.year}</span>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
