"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Asset } from "@/data/types";
import { cn, hostname } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScroll";

export function assetGroup(a: Asset) {
  const t = (a.type ?? "").toLowerCase();
  if (t.includes("related initiative")) return "DilRaju Dreams";
  if (t.includes("portrait") || t.includes("logo")) return "Brand & people";
  if (t.includes("award") || t.includes("event") || a.film === "SVC archive video") return "Moments";
  return "Film artwork";
}

const GROUPS = ["All", "Film artwork", "Moments", "Brand & people", "DilRaju Dreams"];

export function Gallery({ assets }: { assets: Asset[] }) {
  const [group, setGroup] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const list = useMemo(() => assets.filter((a) => a.src && (group === "All" || assetGroup(a) === group)), [assets, group]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: assets.length };
    assets.forEach((a) => (c[assetGroup(a)] = (c[assetGroup(a)] ?? 0) + 1));
    return c;
  }, [assets]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step, lenis]);

  const current = open !== null ? list[open] : null;

  return (
    <div>
      <LayoutGroup id="gallery-groups">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Image type">
          {GROUPS.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={cn("relative shrink-0 rounded-[2px] px-4 py-2.5 text-[0.68rem] font-bold tracking-[0.16em] uppercase transition-colors", group === g ? "text-ink" : "text-paper/70 hover:text-paper")}
            >
              {group === g && <motion.span layoutId="gallery-pill" className="absolute inset-0 rounded-[2px] bg-gold" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">
                {g} <span className={cn("ml-1 tabular-nums tracking-[0.06em]", group === g ? "text-ink/60" : "text-dim")}>{counts[g] ?? 0}</span>
              </span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.div key={group} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {list.map((a, i) => (
          <motion.button
            key={a.id}
            type="button"
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[2px] text-left ring-1 ring-gold/20 transition hover:ring-gold/60"
            aria-label={`Open image: ${a.title ?? a.film ?? a.id}`}
          >
            <Image
              src={a.src!}
              alt={a.title ?? a.film ?? ""}
              width={a.width}
              height={a.height}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/10 to-transparent p-4 opacity-0 transition duration-500 group-hover:opacity-100">
              <span className="text-[0.6rem] font-bold tracking-[0.2em] text-gold uppercase">{a.film ?? assetGroup(a)}</span>
              <span className="mt-1 line-clamp-2 text-xs text-paper/90">{a.title}</span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && (
              <motion.div
                className="fixed inset-0 z-[95] flex flex-col bg-ink/95 backdrop-blur-md"
                role="dialog"
                aria-modal="true"
                aria-label={current.title ?? "Image"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="shell flex h-20 shrink-0 items-center justify-between gap-4">
                  <p className="tabular-nums tracking-[0.06em] text-xs text-mute">
                    <span className="text-gold">{String(open! + 1).padStart(2, "0")}</span> / {String(list.length).padStart(2, "0")}
                  </p>
                  <button onClick={close} autoFocus className="rounded-[2px] border border-paper/20 px-4 py-2 text-[0.65rem] font-bold tracking-[0.2em] uppercase hover:border-gold hover:text-gold">
                    Close ✕
                  </button>
                </div>
                <div className="relative min-h-0 flex-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={current.id}
                      className="absolute inset-0 px-4 sm:px-20"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="relative h-full w-full">
                        <Image src={current.src!} alt={current.title ?? ""} fill sizes="100vw" className="object-contain" />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <button onClick={() => step(-1)} aria-label="Previous image" className="absolute top-1/2 left-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-ink/60 hover:border-gold hover:text-gold sm:left-6">
                    ←
                  </button>
                  <button onClick={() => step(1)} aria-label="Next image" className="absolute top-1/2 right-2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-ink/60 hover:border-gold hover:text-gold sm:right-6">
                    →
                  </button>
                </div>
                <div className="shell shrink-0 py-6">
                  <p className="text-[0.62rem] font-bold tracking-[0.2em] text-gold uppercase">
                    {current.film ?? assetGroup(current)} · {current.type}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm text-paper/90">{current.title}</p>
                  {current.sourcePage && (
                    <a href={current.sourcePage} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-dim hover:text-paper">
                      Source: {hostname(current.sourcePage)} ↗
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
