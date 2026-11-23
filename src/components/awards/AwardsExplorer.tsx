"use client";

import { LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Award } from "@/data/types";
import { awardPhotos } from "@/data/awardPhotos";
import { awardClips } from "@/data/awardClips";
import { awardPeople } from "@/data/awardPeople";
import { cn } from "@/lib/utils";
import { type AwardSet, type PosterArt } from "./AwardPoster";
import { AwardCard } from "./AwardCard";

const GROUP_ORDER = ["National Film Awards", "IFFI Indian Panorama", "Nandi Awards", "Filmfare Awards South", "Gaddar Film Awards", "SIIMA", "Other Honours"];
type Scope = "all" | "svc" | "related" | "personal";
const SCOPES: { key: Scope; label: string }[] = [
  { key: "all", label: "All banners" },
  { key: "svc", label: "SVC films" },
  { key: "related", label: "Dil Raju Productions" },
  { key: "personal", label: "Personal honours" },
];

const INK = "#1a0f08";
const PERSONAL_PHOTOS: PosterArt[] = [
  { src: "/images/people/dil-raju-stage.jpg", focus: "50% 22%" },
  { src: "/images/dilraju_portrait_2024.jpg", focus: "50% 36%" },
];
/** The bodies' names on the tabs, short. */
const TAB_NAMES: Record<string, string> = {
  all: "All",
  "National Film Awards": "National Awards",
  "IFFI Indian Panorama": "IFFI",
  "Nandi Awards": "Nandi",
  "Filmfare Awards South": "Filmfare",
  "Gaddar Film Awards": "Gaddar",
  SIIMA: "SIIMA",
  "Other Honours": "Other honours",
};

function scopeOf(a: Award): Scope {
  if (a.bannerScope === "Dil Raju Productions") return "related";
  if (a.bannerScope?.startsWith("Personal")) return "personal";
  return "svc";
}

function sortKey(a: Award) {
  return Number(a.eventYear ?? a.awardYear ?? a.filmYear ?? 0);
}

/** The body's name as it reads on a laurel. */
const BODY_NAMES: Record<string, string> = {
  "IFFI Indian Panorama": "IFFI Indian Panorama",
  "Indian National Cine Academy (INCA) Awards": "INCA Awards",
  "Andhra Pradesh Nagi Reddy-Chakrapani National Film Award": "Nagi Reddy-Chakrapani Award",
};
function laurelName(a: Award) {
  if (a.group !== "Other Honours") return BODY_NAMES[a.group] ?? a.group;
  const body = a.body ?? a.group;
  return BODY_NAMES[body] ?? body.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

/** Awards grouped as posters: one per film, award body and year (or personal honour). */
function toSets(list: Award[]): AwardSet[] {
  const sets = new Map<string, AwardSet>();
  for (const a of list) {
    const label = laurelName(a);
    const year = a.eventYear ?? a.awardYear ?? undefined;
    const key = `${a.filmSlug ?? a.id}|${label}|${year ?? ""}`;
    const set = sets.get(key);
    if (set) set.awards.push(a);
    else {
      const sc = scopeOf(a);
      sets.set(key, {
        key,
        film: a.film ?? undefined,
        filmSlug: a.filmSlug ?? undefined,
        label,
        group: a.group,
        edition: a.edition && !/films of/i.test(a.edition) ? a.edition.replace(/ IFFI$/, "") : undefined,
        year,
        scope: sc === "all" ? "svc" : sc,
        awards: [a],
      });
    }
  }
  return [...sets.values()];
}

/**
 * Each card's picture, fixed over the whole register (so filtering doesn't reshuffle them): footage
 * of that award being presented where there is some, else a photograph of the presentation, else a
 * photograph of the person who received it. Never a film still: a card with none gets no picture.
 */
function assignArt(sets: AwardSet[]) {
  const used = new Map<string, number>();
  const art = new Map<string, PosterArt>();
  for (const set of sets) {
    const ids = new Set(set.awards.map((a) => a.id));
    const clip = awardClips.find((c) => c.awardIds.some((id) => ids.has(id)));
    if (clip) {
      art.set(set.key, { src: clip.poster, clip: clip.src, focus: clip.focus ?? "50% 40%", credit: clip.creditShort, depicts: clip.depicts });
      continue;
    }
    const photo = awardPhotos.find((p) => p.awardIds?.some((id) => ids.has(id)));
    if (photo) {
      art.set(set.key, { src: photo.src, focus: photo.posterFocus ?? photo.focus, shift: photo.posterShift, credit: photo.creditShort });
      continue;
    }
    const person = awardPeople.find((p) => p.awardIds.some((id) => ids.has(id)));
    if (person) {
      art.set(set.key, { src: person.src, focus: person.focus, credit: person.creditShort, depicts: person.depicts });
      continue;
    }
    if (!set.filmSlug) {
      // Personal honours: Dil Raju, in his photographs by turn.
      const n = used.get("") ?? 0;
      used.set("", n + 1);
      art.set(set.key, PERSONAL_PHOTOS[n % PERSONAL_PHOTOS.length]);
      continue;
    }
    art.set(set.key, null);
  }
  return art;
}

export function AwardsExplorer({ awards }: { awards: Award[] }) {
  const [group, setGroup] = useState<string>("all");
  const [scope, setScope] = useState<Scope>("all");

  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    awards.forEach((a) => counts.set(a.group, (counts.get(a.group) ?? 0) + 1));
    return GROUP_ORDER.filter((g) => counts.has(g)).map((g) => ({ key: g, count: counts.get(g)! }));
  }, [awards]);

  const art = useMemo(() => assignArt(toSets([...awards].sort((a, b) => sortKey(b) - sortKey(a) || (a.film ?? "").localeCompare(b.film ?? "")))), [awards]);

  const base = useMemo(
    () => awards.filter((a) => (group === "all" || a.group === group) && (scope === "all" || scopeOf(a) === scope)),
    [awards, group, scope],
  );
  const list = useMemo(
    () => [...base].sort((a, b) => sortKey(b) - sortKey(a) || (a.film ?? "").localeCompare(b.film ?? "")),
    [base],
  );
  const sets = useMemo(() => toSets(list), [list]);

  return (
    <div style={{ color: INK }}>
      {/* The award bodies: plain words, the one chosen underlined */}
      <LayoutGroup id="award-groups">
        <div className="no-scrollbar -mx-4 flex gap-7 overflow-x-auto border-b border-[#1a0f08]/12 px-4 sm:mx-0 sm:gap-9 sm:px-0" role="tablist" aria-label="Award body">
          {[{ key: "all", count: awards.length }, ...groups].map((g) => {
            const on = group === g.key;
            return (
              <button
                key={g.key}
                role="tab"
                aria-selected={on}
                onClick={() => setGroup(g.key)}
                className={cn("relative shrink-0 pt-1 pb-3.5 text-[0.95rem] whitespace-nowrap transition-colors", on ? "font-semibold" : "text-[#8a6a52] hover:text-[#1a0f08]")}
              >
                {TAB_NAMES[g.key] ?? g.key}
                {on && <motion.span layoutId="award-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-saffron-deep" transition={{ type: "spring", stiffness: 420, damping: 38 }} />}
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Whose: the banner, its sister banner, or Dil Raju himself */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem]">
        {SCOPES.map((s) => {
          const on = scope === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setScope(s.key)}
              aria-pressed={on}
              className={cn("transition-colors", on ? "font-semibold underline decoration-saffron-deep decoration-2 underline-offset-[6px]" : "text-[#8a6a52] hover:text-[#1a0f08]")}
            >
              {s.label}
            </button>
          );
        })}
        <span className="ml-auto text-[0.78rem] text-[#8a6a52]" aria-live="polite">
          <span className="font-semibold text-[#1a0f08] tabular-nums">{list.length}</span> {list.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* The awards */}
      {sets.length === 0 ? (
        <p className="py-24 text-center text-[#8a6a52]">Nothing recorded for this choice.</p>
      ) : (
        <ul key={`${group}|${scope}`} className="mt-12 grid items-start gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set, i) => (
            <motion.li
              key={set.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: Math.min(i, 9) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <AwardCard set={set} art={art.get(set.key) ?? null} priority={i < 3} />
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
