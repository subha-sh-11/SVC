"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { VideoTile } from "@/components/films/TrailerButton";
import { GhostButton } from "@/components/ui/Buttons";

export interface TrailerItem {
  slug: string;
  title: string;
  year: number;
  youtubeId: string;
  label: string;
  image: string | null;
}

export function TrailerWall({ items, initial = 8 }: { items: TrailerItem[]; initial?: number }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {shown.map((t, i) => (
            <motion.div
              key={t.slug + t.youtubeId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoTile youtubeId={t.youtubeId} title={`${t.title} (${t.year})`} label={t.label} image={t.image} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {items.length > initial && (
        <div className="mt-14 flex justify-center">
          <GhostButton onClick={() => setAll((v) => !v)} icon="none">
            {all ? "Show fewer" : `Show all ${items.length} videos`}
          </GhostButton>
        </div>
      )}
    </div>
  );
}
