"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef } from "react";

/**
 * Keyed by pathname so every navigation (including /films/a → /films/b)
 * replays it: a curtain sweeps up off the screen while the new page rises in.
 * The first page load renders immediately (the intro sequence covers it).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firstPath = useRef<string | null>(pathname);
  const isFirstPage = firstPath.current !== null && pathname === firstPath.current;
  if (!isFirstPage) firstPath.current = null; // after the first navigation, every page animates

  return (
    <div key={pathname}>
      {!isFirstPage && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[85] origin-top bg-ink-900"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="display text-5xl text-paper/10 italic">SVC</span>
          </div>
        </motion.div>
      )}
      <motion.div
        initial={isFirstPage ? false : { opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
