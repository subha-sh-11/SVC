import Image from "next/image";
import Link from "next/link";
import type { Film } from "@/data/types";
import { focal } from "@/data/focal";
import { posterWall } from "@/data/posters";
import { Marquee, Reveal } from "@/components/ui/motion";

const CARD_ASPECT = 2 / 2.9;

/**
 * Film artwork is mostly wide (16:9). For a tall poster card, position the crop
 * on the faces detected by scripts/focal_points.py.
 */
function posterPosition(src: string) {
  const f = focal[src];
  if (!f) return "50% 50%";
  const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
  const imageAspect = f.w / f.h;
  if (imageAspect > CARD_ASPECT) {
    const visible = CARD_ASPECT / imageAspect;
    return `${Math.round(clamp((f.x - visible / 2) / (1 - visible)) * 100)}% 50%`;
  }
  const visible = imageAspect / CARD_ASPECT;
  return `50% ${Math.round(clamp((f.y - visible / 2) / (1 - visible)) * 100)}%`;
}

/** Official poster for a film when one was found (see scripts/fetch_posters.py). */
const OFFICIAL = new Map(posterWall.filter((t) => t.official).map((t) => [t.slug, t.lg]));

/** SVC's own productions: a row of posters, then every other title scrolling past. */
export function ProductionsShowcase({ featured, others, total }: { featured: Film[]; others: Film[]; total: number }) {
  return (
    <section id="productions" className="pt-10 pb-28 sm:pt-14 sm:pb-36">
      <div className="shell text-center">
        <Reveal y={12}>
          <p className="text-[0.78rem] font-semibold tracking-[0.32em] text-dim uppercase">SVC productions</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-4 text-[clamp(2.2rem,5.4vw,5.8rem)] leading-[0.95] font-bold tracking-[-0.015em] uppercase">Films produced by SVC</h2>
        </Reveal>
      </div>

      <div className="shell mt-14 sm:mt-16">
        <ul className="no-scrollbar -mx-[clamp(1rem,4vw,3rem)] flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,3rem)] gap-5 overflow-x-auto px-[clamp(1rem,4vw,3rem)] pb-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-8 lg:overflow-visible lg:px-0">
          {featured.map((f, i) => (
            <Reveal as="li" key={f.slug} delay={i * 0.08} className="w-[62vw] max-w-[18rem] shrink-0 snap-start sm:w-[38vw] lg:w-auto lg:max-w-none">
              <Link href={`/films/${f.slug}`} className="group block">
                <div className="relative aspect-[2/2.9] overflow-hidden bg-ink-800 shadow-[0_18px_40px_-18px_rgba(59,26,7,0.4)] transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:shadow-[0_34px_60px_-22px_rgba(59,26,7,0.55)]">
                  <Image
                    src={OFFICIAL.get(f.slug) ?? f.image!}
                    alt={`${f.title} (${f.year}) ${OFFICIAL.has(f.slug) ? "poster" : "artwork"}`}
                    fill
                    sizes="(min-width: 1024px) 19vw, (min-width: 640px) 38vw, 62vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    style={{ objectPosition: OFFICIAL.has(f.slug) ? "50% 50%" : posterPosition(f.image!) }}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="text-[clamp(1rem,1.3vw,1.45rem)] leading-tight font-semibold tracking-[0.02em] uppercase transition-colors duration-300 group-hover:text-saffron-deep">
                    {f.title}
                  </h3>
                  <span className="shrink-0 text-xs tabular-nums text-dim">{f.year}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/films"
            className="inline-flex items-center gap-3 bg-[linear-gradient(180deg,#e8731a,#c2520e)] px-8 py-4 text-[0.78rem] font-bold tracking-[0.18em] text-white uppercase transition-colors duration-300 hover:brightness-110 focus-visible:outline-offset-4"
          >
            View all {total} productions
          </Link>
        </Reveal>
      </div>

      {/* Every other SVC production, scrolling */}
      <div className="mt-24 sm:mt-28">
        <Reveal y={10}>
          <p className="text-center text-[0.78rem] font-semibold tracking-[0.32em] text-dim uppercase">Also produced by SVC</p>
        </Reveal>
        <Marquee speed={0.9} className="mt-10">
          {others.map((f) => (
            <span key={f.slug} className="flex items-center">
              <span className="px-8 text-[clamp(1.4rem,2.3vw,2.3rem)] font-bold tracking-[0.01em] text-paper/30 uppercase sm:px-12">{f.title}</span>
              <span className="h-2 w-2 shrink-0 rotate-45 bg-marigold" aria-hidden="true" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
