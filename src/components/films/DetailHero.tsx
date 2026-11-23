"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Film } from "@/data/types";
import { formatDate, initials } from "@/lib/utils";
import { SplitWords } from "@/components/ui/motion";
import { RoleBadge } from "./FilmCard";
import { TrailerButton } from "./TrailerButton";

export function DetailHero({ film }: { film: Film }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const date = formatDate(film.releaseDate) ?? String(film.year);

  return (
    <section ref={ref} data-header-theme="dark" className="relative flex min-h-[92svh] items-end overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        {film.image ? (
          <>
            {/* Blurred fill keeps low-resolution artwork from looking soft at full bleed */}
            <Image src={film.image} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-60 blur-2xl" aria-hidden="true" />
            <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}>
              <Image src={film.image} alt={`${film.title} artwork`} fill loading="eager" sizes="100vw" className="object-cover" />
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_70%_30%,rgba(232,181,58,0.25),transparent_60%),radial-gradient(60%_60%_at_10%_90%,rgba(232,115,26,0.22),transparent_60%)] bg-ink-800">
            <span className="display absolute top-1/2 right-[6%] -translate-y-1/2 text-[30vw] leading-none text-paper/[0.04]">{initials(film.title)}</span>
          </div>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,15,6,0.92)_0%,rgba(31,15,6,0.55)_45%,rgba(31,15,6,0.1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#1f0f06_2%,rgba(31,15,6,0.2)_45%,rgba(31,15,6,0.55)_100%)]" />

      <motion.div className="shell relative pt-40 pb-16 sm:pb-20" style={{ opacity: fade }}>
        <motion.nav aria-label="Breadcrumb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.22em] text-mute uppercase">
          <Link href="/films" className="transition hover:text-gold">
            Films
          </Link>
          <span className="text-dim">/</span>
          <span className="text-paper/80">{film.year}</span>
        </motion.nav>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }} className="mt-6 flex flex-wrap items-center gap-3">
          <RoleBadge film={film} />
          <span className="text-xs text-mute">{film.language}</span>
          {film.isSeries && <span className="rounded-[2px] border border-paper/20 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.18em] text-paper/80 uppercase">Web series</span>}
        </motion.div>
        <SplitWords as="h1" text={film.title} trigger className="display mt-6 block max-w-5xl text-[2.6rem] sm:text-6xl lg:text-[6.2rem]" stagger={0.07} delay={0.3} />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.9 }} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <span>
            <span className="text-dim">Released </span>
            <span className="text-paper">{date}</span>
          </span>
          {film.genre && (
            <span>
              <span className="text-dim">Genre </span>
              <span className="text-paper">{film.genre}</span>
            </span>
          )}
          {film.director && (
            <span>
              <span className="text-dim">Director </span>
              <span className="text-paper">{film.director}</span>
            </span>
          )}
        </motion.div>
        {film.trailer && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.9 }} className="mt-10">
            <TrailerButton youtubeId={film.trailer} title={film.title} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
