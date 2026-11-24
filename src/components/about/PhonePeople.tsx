"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { TeamMember } from "@/data/team";

type Person = Pick<TeamMember, "name" | "role" | "image" | "bio" | "note" | "credit">;

/** Phones: the people as photo pins; tapping one opens who they are. */
export function PhonePeople({ people }: { people: Person[] }) {
  const [open, setOpen] = useState<Person | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus({ preventScroll: true });
  }, []);
  return (
    <>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
        {people.map((m) => (
          <li key={m.name}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${m.name}, ${m.role}: read more`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(m);
              }}
              className="block w-full text-left"
            >
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-[#f1e4cf] shadow-[0_10px_24px_-16px_rgba(59,26,7,0.55)]">
                <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="48vw" className="object-cover object-[50%_25%]" />
                <span aria-hidden="true" className="absolute top-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#2a1408] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.45)]">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </span>
              <span className="mt-2 block px-0.5 font-display text-[1.05rem] leading-tight text-[#2a1408]">{m.name}</span>
              <span className="mt-0.5 block px-0.5 text-[max(0.58rem,9px)] leading-snug font-bold tracking-[0.14em] text-saffron-deep uppercase">{m.role}</span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>{open && <PersonSheet key={open.name} m={open} onClose={close} />}</AnimatePresence>
    </>
  );
}

/** Who they are, over their own photograph, blurred to fill the screen. */
function PersonSheet({ m, onClose }: { m: Person; onClose: () => void }) {
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis, onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${m.name}, ${m.role}`}
      data-lenis-prevent
      // Solid underneath, so nothing of the page behind ever shows through.
      className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-[#140a05] text-white"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Their photograph, blurred into a wash of its own colours, behind everything */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden">
        <Image src={m.image} alt="" fill sizes="100vw" className="scale-[1.6] object-cover object-[50%_25%] blur-3xl brightness-75 saturate-150" />
        <div className="absolute inset-0 bg-[#140a05]/45" />
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/20 backdrop-blur-md"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="relative">
        {/* The photograph itself, large, melting into the wash below */}
        <div className="relative h-[62svh] min-h-[340px] [mask-image:linear-gradient(180deg,#000_62%,transparent)]">
          <Image src={m.image} alt={`${m.name}, ${m.role}`} fill priority sizes="100vw" className="object-cover object-[50%_22%]" />
          {/* Deepens the foot of the photo, where the name and role sit over it */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#140a05]/70" />
        </div>

        <div className="relative -mt-24 px-6 pb-12">
          <p className="text-[max(0.62rem,9px)] font-bold tracking-[0.22em] text-[#f2c230] uppercase">{m.role}</p>
          <h2 className="mt-2 font-display text-[2.6rem] leading-[1] [text-shadow:0_4px_24px_rgba(0,0,0,0.45)]">{m.name}</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/90">{m.bio}</p>
          {m.note && <p className="mt-3 text-[0.84rem] leading-relaxed text-white/65">{m.note}</p>}
          <p className="mt-8 text-[max(0.6rem,9px)] text-white/40">{m.credit}</p>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
