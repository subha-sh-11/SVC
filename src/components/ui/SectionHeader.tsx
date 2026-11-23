import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal, SplitWords } from "./motion";
import { ArrowIcon } from "./Buttons";

export function SectionHeader({
  eyebrow,
  title,
  italic = [],
  description,
  link,
  className,
  align = "split",
}: {
  eyebrow: string;
  title: string;
  italic?: string[];
  description?: string;
  link?: { href: string; label: string };
  className?: string;
  align?: "split" | "stack";
}) {
  return (
    <div className={cn("flex flex-col gap-8", align === "split" && "lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        <Reveal y={12}>
          <p className="eyebrow flex items-center gap-3">
            {eyebrow}
          </p>
        </Reveal>
        <SplitWords as="h2" text={title} italicWords={italic} className="display mt-5 block text-4xl sm:text-5xl lg:text-6xl" />
      </div>
      {(description || link) && (
        <Reveal delay={0.2} className="flex max-w-md flex-col gap-6 lg:items-end lg:text-right">
          {description && <p className="text-[0.95rem] leading-relaxed text-mute">{description}</p>}
          {link && (
            <Link href={link.href} className="group inline-flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-paper uppercase">
              <span className="link-underline pb-1">{link.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-paper/25 transition duration-500 group-hover:rotate-[-45deg] group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                <ArrowIcon />
              </span>
            </Link>
          )}
        </Reveal>
      )}
    </div>
  );
}

/** Page-level hero heading used on inner pages. */
export function PageHero({
  eyebrow,
  title,
  italic = [],
  description,
  compact = false,
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string[];
  description?: string;
  /** A shorter, smaller introduction under the title. */
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-40 pb-16 sm:pt-48 sm:pb-20">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[120px]" />
      <div className="shell relative">
        <Reveal y={12}>
          <p className="eyebrow flex items-center gap-3">
            {eyebrow}
          </p>
        </Reveal>
        <SplitWords as="h1" text={title} italicWords={italic} stagger={0.08} className="display mt-6 block max-w-5xl text-[2.6rem] sm:text-6xl lg:text-[5.8rem]" />
        {description && (
          <Reveal delay={0.35} className={compact ? "mt-6 max-w-xl" : "mt-8 max-w-2xl"}>
            <p className={compact ? "text-[0.95rem] leading-relaxed text-mute" : "text-lg leading-relaxed text-mute"}>{description}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
