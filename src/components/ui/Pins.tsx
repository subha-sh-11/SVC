import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Phones: a Pinterest-style board. Items are dealt into two columns, each to whichever column is
 * shorter so far, so the columns stay level however tall each pin is. `height` is a pin's height
 * per unit of width (picture plus caption).
 */
export function twoColumns<T>(items: T[], height: (item: T, index: number) => number): [T[], T[]] {
  const cols: [T[], T[]] = [[], []];
  const h = [0, 0];
  items.forEach((item, i) => {
    const c = h[0] <= h[1] ? 0 : 1;
    cols[c].push(item);
    h[c] += height(item, i);
  });
  return cols;
}

/** The board itself: two columns side by side, each a stack of pins. */
export function PinBoard({ left, right, className }: { left: ReactNode; right: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 items-start gap-x-3", className)}>
      <div className="flex min-w-0 flex-col gap-5">{left}</div>
      <div className="flex min-w-0 flex-col gap-5">{right}</div>
    </div>
  );
}

/** Pins come in a few heights (height per unit of width), in turn, so the board staggers. */
export const PIN_SHAPES = [1.3, 1, 1.25, 0.85, 1.15, 1.05] as const;
