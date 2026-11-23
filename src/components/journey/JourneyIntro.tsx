import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export type CollagePoster = { src: string; position?: string };

const COLUMNS = 9;

/**
 * A wall of posters leaning back into the page, its columns drifting up and down at their own
 * pace. It fades out towards the words, and at the top and bottom, so it needs no backdrop colour.
 */
function PosterDrift({ posters }: { posters: CollagePoster[] }) {
  // At least seven posters a column, so every column is taller than the space it fills.
  const pool = Array.from({ length: Math.max(posters.length, COLUMNS * 7) }, (_, i) => posters[i % posters.length]);
  const columns = Array.from({ length: COLUMNS }, (_, c) => pool.filter((_, i) => i % COLUMNS === c));
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-[24rem] overflow-hidden sm:h-[28rem]",
        "lg:top-24 lg:bottom-0 lg:right-0 lg:left-[max(56%,calc((100vw-1600px)/2+58rem))] lg:h-auto",
        // Fades out at the top and bottom, and on wide screens towards the words on the left
        "[mask-image:linear-gradient(180deg,transparent_0%,#000_30%,#000_50%,transparent_85%)]",
        "lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_20%),linear-gradient(180deg,transparent_0%,#000_20%,#000_72%,transparent_100%)] lg:[mask-composite:intersect]",
      )}
    >
      <div className="absolute top-1/2 left-1/2 flex w-max gap-3 [transform:translate(-42%,-50%)_perspective(1800px)_rotateX(14deg)_rotateY(-16deg)_rotateZ(7deg)] sm:gap-4">
        {columns.map((col, c) => (
          <div key={c} className="w-[clamp(96px,8.6vw,176px)] shrink-0" style={{ marginTop: `${(c % 3) * 3.5}rem` }}>
            <div className={cn("poster-drift flex flex-col gap-3 sm:gap-4", c % 2 === 1 && "poster-drift--down")} style={{ "--drift": `${70 + (c % 4) * 14}s` } as CSSProperties}>
              {[...col, ...col].map((p, i) => (
                <div key={i} className="relative aspect-[2/3] overflow-hidden rounded-[6px] bg-[#1c0d05] shadow-[0_18px_30px_-16px_rgba(59,26,7,0.55)] ring-1 ring-black/10">
                  <Image src={p.src} alt="" fill sizes="180px" quality={60} className="object-cover" style={{ objectPosition: p.position }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The opening of a journey page: its headline and story, with the films' posters drifting on the right. */
export function JourneyIntro({ title, text, posters }: { title: ReactNode; text: ReactNode; posters: CollagePoster[] }) {
  return (
    <section className="relative overflow-hidden">
      <PosterDrift posters={posters} />
      <div className="shell relative pt-[20rem] pb-12 sm:pt-[24rem] lg:flex lg:min-h-[44rem] lg:flex-col lg:justify-center lg:pt-28 lg:pb-16">
        <Reveal delay={0.08}>
          <h1 className="display max-w-[9em] text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-mute">{text}</p>
        </Reveal>
      </div>
    </section>
  );
}
