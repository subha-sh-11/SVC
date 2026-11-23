"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/** Pulls gently toward the cursor while hovered. */
function useMagnet(strength = 0.25) {
  const ref = useRef<HTMLElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  return { ref, x, y, onMove, onLeave };
}

const base =
  "group relative inline-flex items-center gap-3 rounded-[2px] px-7 py-3.5 text-[0.74rem] font-semibold tracking-[0.24em] uppercase transition-colors duration-500";

/** Small gold diamond that holds the button icon. */
function IconDiamond({ children, tone }: { children: ReactNode; tone: "solid" | "line" }) {
  return (
    <span className="relative grid h-6 w-6 place-items-center">
      <span
        className={cn(
          "absolute inset-[3px] rotate-45 transition-transform duration-500 group-hover:rotate-[135deg]",
          tone === "solid" ? "bg-ink/15" : "border border-current/50",
        )}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

export function PrimaryButton({
  href,
  children,
  className,
  onClick,
  icon = "arrow",
  type = "button",
  disabled,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: "arrow" | "play";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const m = useMagnet();
  const inner = (
    <>
      {/* Outer gold frame that opens out on hover */}
      <span className="pointer-events-none absolute -inset-[5px] rounded-[3px] border border-gold/45 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-inset-[8px] group-hover:border-gold/80" />
      {/* Light sweeping across the gold */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2px]">
        <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-[320%]" />
      </span>
      <span className="relative">{children}</span>
      <IconDiamond tone="solid">{icon === "play" ? <PlayIcon /> : <ArrowIcon />}</IconDiamond>
    </>
  );
  const cls = cn(base, "bg-gradient-to-b from-gold-bright to-gold text-ink shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--color-gold)_55%,transparent)] hover:to-gold-bright", className);
  return (
    <motion.span style={{ x: m.x, y: m.y }} className="inline-block" onMouseMove={m.onMove} onMouseLeave={m.onLeave}>
      {href ? (
        <Link href={href} ref={m.ref as React.Ref<HTMLAnchorElement>} className={cls}>
          {inner}
        </Link>
      ) : (
        <button type={type} disabled={disabled} ref={m.ref as React.Ref<HTMLButtonElement>} onClick={onClick} className={cn(cls, "disabled:cursor-wait disabled:opacity-70")}>
          {inner}
        </button>
      )}
    </motion.span>
  );
}

export function GhostButton({ href, children, className, onClick, icon = "arrow", external }: { href?: string; children: ReactNode; className?: string; onClick?: () => void; icon?: "arrow" | "play" | "none"; external?: boolean }) {
  const cls = cn(base, "border border-gold/50 bg-ink/30 text-paper backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:text-gold-bright", className);
  const inner = (
    <>
      <span className="relative">{children}</span>
      {icon !== "none" && <IconDiamond tone="line">{icon === "play" ? <PlayIcon /> : <ArrowIcon />}</IconDiamond>}
    </>
  );
  if (href && external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-3 w-3", className)} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-2.5 w-2.5", className)} fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5-9-5.5z" />
    </svg>
  );
}
