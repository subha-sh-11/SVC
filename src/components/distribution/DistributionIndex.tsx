"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DistributionRecord } from "@/data/types";
import { cn } from "@/lib/utils";

function territoryGroup(t: string | null) {
  const s = (t ?? "").toLowerCase();
  if (!s || s.includes("not specified")) return "Unspecified";
  if (s.includes("nizam")) return "Nizam";
  if (s.includes("andhra") || s.includes("telangana") || s.includes("telugu")) return "Telugu states";
  return "Other";
}

const FILTERS = ["All", "Nizam", "Telugu states", "Other", "Unspecified"];

export function DistributionIndex({ records }: { records: DistributionRecord[] }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const byYear = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = records.filter((r) => (filter === "All" || territoryGroup(r.territory) === filter) && (!term || r.film.toLowerCase().includes(term)));
    const map = new Map<number, DistributionRecord[]>();
    list.forEach((r) => map.set(r.year, [...(map.get(r.year) ?? []), r]));
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [records, filter, q]);

  const total = byYear.reduce((n, [, l]) => n + l.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-gold/15 py-6 md:flex-row md:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a film…"
          aria-label="Search distribution records"
          className="w-full border-b border-paper/20 bg-transparent py-2 text-sm outline-none placeholder:text-dim focus:border-gold md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[0.6rem] font-bold tracking-[0.2em] text-dim uppercase">Territory</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn("rounded-[2px] border px-3 py-1.5 text-[0.68rem] font-semibold transition", filter === f ? "border-gold bg-gold/10 text-gold-bright" : "border-gold/25 text-paper/70 hover:border-paper/40")}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-mute md:ml-auto">
          <span className="tabular-nums tracking-[0.06em] text-gold">{total}</span> records
        </span>
      </div>

      <ol className="mt-6">
        {byYear.map(([year, list]) => (
          <motion.li
            key={year}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 border-b border-gold/15 py-8 md:grid-cols-[10rem_1fr]"
          >
            <span className="display text-5xl text-transparent [-webkit-text-stroke:1px_rgba(232,181,58,0.65)]">{year}</span>
            <ul className="flex flex-wrap gap-2.5">
              {list.map((r) => {
                const inner = (
                  <>
                    <span className="text-sm text-paper">{r.film}</span>
                    <span className="text-[0.62rem] tracking-[0.06em] text-dim">{r.territory}</span>
                  </>
                );
                return (
                  <li key={`${r.film}-${r.territory}`}>
                    {r.filmSlug ? (
                      <Link href={`/films/${r.filmSlug}`} className="flex flex-col rounded-[2px] border border-gold/30 bg-gold/[0.04] px-3.5 py-2 transition hover:border-gold">
                        {inner}
                      </Link>
                    ) : (
                      <span className="flex flex-col rounded-[2px] border border-gold/15 px-3.5 py-2">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
