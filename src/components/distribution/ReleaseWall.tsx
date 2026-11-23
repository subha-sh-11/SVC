"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DistributionRecord } from "@/data/types";
import { releasePoster } from "@/data/releasePoster";
import { territoryShort } from "@/lib/territory";
import { cn } from "@/lib/utils";

function territoryGroup(t: string | null) {
  const s = (t ?? "").toLowerCase();
  if (!s || s.includes("not specified")) return "Unspecified";
  if (s.includes("nizam")) return "Nizam";
  if (s.includes("andhra") || s.includes("telangana") || s.includes("telugu")) return "Telugu states";
  return "Other";
}
const FILTERS = ["All", "Nizam", "Telugu states", "Other", "Unspecified"];

function statusTag(s: string | null) {
  if (/announced/i.test(s ?? "")) return "Announced";
  if (/rights/i.test(s ?? "")) return "Rights reported";
  return null;
}

/** A release, as its poster, with the film and territory beneath. SVC's own films open their page. */
function ReleaseTile({ r }: { r: DistributionRecord }) {
  const poster = releasePoster(r);
  const tag = statusTag(r.status);
  const inner = (
    <>
      <div className="relative aspect-[2/3] overflow-hidden rounded-[6px] bg-[#1c0d05] shadow-[0_14px_26px_-18px_rgba(59,26,7,0.65)] ring-1 ring-black/[0.06] transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_36px_-20px_rgba(59,26,7,0.75)]">
        {poster ? (
          <Image
            src={poster.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 11vw, (min-width: 1024px) 15vw, (min-width: 768px) 18vw, (min-width: 640px) 23vw, 31vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            style={{ objectPosition: poster.position }}
          />
        ) : (
          // No poster to be found: the title, set like one
          <div className="@container absolute inset-0 grid place-items-center bg-[radial-gradient(120%_80%_at_50%_0%,#8a330e,#1c0d05_78%)] p-[12%] text-center">
            <span className="pointer-events-none absolute inset-[6%] rounded-[3px] border border-[#ffd873]/30" />
            <span className="display text-[16cqw] leading-[1.02] text-ivory">{r.film}</span>
          </div>
        )}
        {tag && <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[max(0.55rem,9px)] font-bold tracking-[0.12em] text-white uppercase backdrop-blur-sm">{tag}</span>}
        {r.filmSlug && <span className="absolute top-2 right-2 rounded-full bg-saffron-deep px-2 py-0.5 text-[max(0.55rem,9px)] font-bold tracking-[0.14em] text-white uppercase">SVC</span>}
      </div>
      <p className="mt-3 truncate font-title text-[0.95rem] leading-tight tracking-[0.01em] text-paper uppercase transition-colors group-hover:text-saffron-deep">{r.film}</p>
      <p className="mt-0.5 truncate text-[0.72rem] text-dim" title={r.territory ?? undefined}>
        {territoryShort(r.territory)}
      </p>
    </>
  );
  return (
    <li>
      {r.filmSlug ? (
        <Link href={`/films/${r.filmSlug}`} aria-label={`${r.film} (${r.year}), an SVC film`} className="group block">
          {inner}
        </Link>
      ) : (
        <div className="group">{inner}</div>
      )}
    </li>
  );
}

/**
 * Every recorded release as a wall of posters, newest first. Filter by territory, or search by film.
 */
export function ReleaseWall({ records }: { records: DistributionRecord[] }) {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const base = useMemo(() => {
    const term = q.trim().toLowerCase();
    return records.filter((r) => (filter === "All" || territoryGroup(r.territory) === filter) && (!term || r.film.toLowerCase().includes(term)));
  }, [records, filter, q]);

  const shown = useMemo(() => [...base].sort((a, b) => b.year - a.year), [base]);
  const total = shown.length;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition",
                filter === f ? "border-saffron-deep bg-saffron-deep text-white" : "border-paper/15 bg-white text-paper/75 hover:border-paper/40",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="relative flex items-center md:w-72">
          <span className="sr-only">Search a film</span>
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 h-4 w-4 text-dim" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a film" className="w-full rounded-full bg-white py-2.5 pr-4 pl-9 text-sm text-paper ring-1 ring-black/[0.08] outline-none placeholder:text-dim focus:ring-saffron-deep" />
        </label>
      </div>

      {/* The wall */}
      {total === 0 ? (
        <p className="py-24 text-center text-mute">No films match.</p>
      ) : (
        <motion.ul
          key={`${filter}|${q}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10"
        >
          {shown.map((r) => (
            <ReleaseTile key={`${r.film}-${r.year}`} r={r} />
          ))}
        </motion.ul>
      )}
    </div>
  );
}
