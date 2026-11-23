"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useState } from "react";
import { Counter } from "@/components/ui/motion";
import { awardPhotos } from "@/data/awardPhotos";
import { AwardWall } from "./AwardWall";

/** The register's headline numbers. Each one opens the wall of award photographs. */
export function AwardStats({ stats }: { stats: { value: number; label: string }[] }) {
  const [wall, setWall] = useState<string | null>(null);
  const close = useCallback(() => setWall(null), []);

  return (
    <>
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setWall(`${s.value} ${s.label.toLowerCase()}`)}
            className="group rounded-xl p-3 -m-3 text-left transition-colors hover:bg-ink-900"
            aria-haspopup="dialog"
          >
            <Counter to={s.value} className={i === 0 ? "display block text-5xl text-gold-gradient" : "display block text-5xl text-paper"} />
            <span className="mt-2 block text-xs text-mute">{s.label}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[max(0.62rem,9px)] font-bold tracking-[0.16em] text-gold uppercase">
              View photos
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence>{wall && <AwardWall photos={awardPhotos} title={wall} onClose={close} />}</AnimatePresence>
    </>
  );
}
