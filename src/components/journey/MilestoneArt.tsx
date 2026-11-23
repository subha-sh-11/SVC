import Image from "next/image";
import type { Milestone } from "@/data/types";
import { journeyImages } from "@/data/journeyImages";
import { cn } from "@/lib/utils";

/**
 * The films of a stretch of years, their posters fanned out over a blur of the first (or of a
 * still). They spread a little further under the pointer.
 */
function PosterFan({ posters, backdrop }: { posters: NonNullable<Milestone["posters"]>; backdrop?: string | null }) {
  const n = posters.length;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1c0d05] [--spread:54%] group-hover:[--spread:66%]">
      <Image src={backdrop ?? posters[0].src} alt="" fill sizes="240px" className="scale-125 object-cover opacity-45 blur-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_75%_at_50%_100%,rgba(232,115,26,0.32),transparent_70%),linear-gradient(180deg,rgba(28,13,5,0.25),rgba(28,13,5,0.6))]" />
      {posters.map((p, i) => {
        const c = i - (n - 1) / 2;
        return (
          <div
            key={p.src}
            className="absolute bottom-[-7%] left-1/2 aspect-[2/3] h-[88%] origin-bottom overflow-hidden rounded-[5px] shadow-[0_16px_28px_-10px_rgba(0,0,0,0.75)] ring-1 ring-white/15 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translateX(calc(-50% + ${c} * var(--spread))) translateY(${Math.abs(c) * 6}%) rotate(${c * 5}deg)`,
              zIndex: 10 - Math.round(Math.abs(c) * 2),
            }}
          >
            <Image src={p.src} alt={p.title} fill sizes="180px" className="object-cover" style={{ objectPosition: p.position }} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * A milestone's picture (see journeyImages.ts), or the posters of its films. Where nothing real
 * exists yet, a saffron title card carries its name.
 */
export function MilestoneImage({ m, sizes, className }: { m: Milestone; sizes: string; className?: string }) {
  const img = m.title in journeyImages ? journeyImages[m.title] : m.image ? { src: m.image } : null;
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl bg-ink-900 shadow-[0_22px_44px_-26px_rgba(59,26,7,0.5)] ring-1 ring-black/[0.06]", className)}>
      {m.posters?.length ? (
        <PosterFan posters={m.posters} backdrop={m.image} />
      ) : img ? (
        <Image
          src={img.src}
          alt=""
          fill
          sizes={sizes}
          className={img.contain ? "object-contain p-[9%]" : "object-cover"}
          style={{ objectPosition: img.focus, background: img.contain }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(90%_80%_at_70%_30%,#e8731a_0%,#a63f0a_48%,#4a1a05_100%)] px-6">
          <span className="text-center font-title text-[clamp(1.8rem,3.4vw,3rem)] leading-[0.95] tracking-[0.02em] text-transparent uppercase [-webkit-text-stroke:1.2px_rgba(255,236,200,0.85)]">
            {m.title.replace(/\s+(launch|announced through .*)$/i, "")}
          </span>
        </div>
      )}
      {m.badge && (
        <span className="absolute top-3 left-3 z-20 rounded-full bg-black/55 px-3 py-1 text-[0.6rem] font-bold tracking-[0.18em] text-white uppercase backdrop-blur-sm">{m.badge}</span>
      )}
    </div>
  );
}
