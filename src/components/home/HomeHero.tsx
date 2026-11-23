"use client";

import { motion } from "motion/react";
import { SvcLockup } from "@/components/brand/SvcLockup";
import { useIntroDone } from "@/components/providers/IntroProvider";

/**
 * The home hero is the opening sequence's final frame, made permanent: the god
 * symbol beside the poster-filled golden SVC and the name, drawn by the same
 * component in the same place. When the intro dissolves, nothing moves; the
 * hero then adds its line, buttons, a gold glint and a scroll cue. Scrolling zooms it
 * out into Dil Raju's portrait and the banner's story (see HomeOpening).
 */
export function HomeHero() {
  const done = useIntroDone();

  return (
    <section id="top" className="theme-light relative h-full overflow-hidden bg-ink">
      {/* A soft gold glow arrives behind the lockup after the handoff */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_48%_at_50%_44%,rgba(245,158,27,0.15),rgba(242,194,48,0.05)_45%,transparent_72%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />

      {/* Same position as the intro's lockup */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <SvcLockup stage="brand" still nameAs="h1" showExtras={done} glint={done} />
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#the-banner"
        aria-label="Scroll to The banner"
        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.58rem] font-semibold tracking-[0.34em] text-[#9a7558] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ delay: done ? 0.9 : 0, duration: 0.8 }}
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-[#3b1a07]/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#f2c230] to-[#e8731a]"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
