import Image from "next/image";
import Link from "next/link";
import type { Award } from "@/data/types";
import { titleLogos } from "@/data/posters";
import { cn } from "@/lib/utils";

/** The picture behind a poster: a ceremony photograph, a film still or the film's poster. */
export type PosterArt = { src: string; focus?: string; credit?: string; /** Zoom in on the focus (for official posters, past their own lettering). */ zoom?: number; /** Move the picture down (CSS length). */ shift?: string; /** Footage of the presentation (src is then its first frame). */ clip?: string; /** What the picture or footage shows. */ depicts?: string } | null;

/** One poster: the awards a film won from one body in one year (or a personal honour). */
export type AwardSet = {
  key: string;
  film?: string;
  filmSlug?: string;
  label: string;
  /** The award body's group (awards.ts), for its colour. */
  group?: string;
  edition?: string;
  year?: number | string;
  scope: "svc" | "related" | "personal";
  awards: Award[];
};

/* A laurel branch: leaves along a curve, as on festival laurels. */
const STEM = { p0: [17, 55], p1: [3, 44], p2: [2, 20], p3: [13, 3] };
function bez(t: number, k: 0 | 1) {
  const { p0, p1, p2, p3 } = STEM;
  const u = 1 - t;
  return u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k];
}
const LEAVES = Array.from({ length: 7 }, (_, i) => {
  const t = 0.1 + i * 0.13;
  const x = bez(t, 0);
  const y = bez(t, 1);
  const dx = bez(t + 0.01, 0) - x;
  const dy = bez(t + 0.01, 1) - y;
  const a = (Math.atan2(dy, dx) * 180) / Math.PI;
  const s = 1 - i * 0.07;
  return { x, y, a, s };
});

function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 22 58" className={cn("h-full w-auto shrink-0", flip && "-scale-x-100")} fill="currentColor" aria-hidden="true">
      <path d="M17 55 C3 44 2 20 13 3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <g key={i}>
          <ellipse cx={l.x} cy={l.y} rx={4.6 * l.s} ry={1.8 * l.s} transform={`rotate(${l.a - 38} ${l.x} ${l.y}) translate(${-3.6 * l.s} 0)`} />
          <ellipse cx={l.x} cy={l.y} rx={4 * l.s} ry={1.6 * l.s} transform={`rotate(${l.a + 40} ${l.x} ${l.y}) translate(${-3.2 * l.s} 0)`} />
        </g>
      ))}
    </svg>
  );
}

/** "Producer: X; director: Y" -> "X", film-level records -> "" (the film itself). */
export function shortRecipient(a: Award) {
  let r = (a.recipient ?? "").replace(/^Producer:\s*/i, "").split(/;| — /)[0].trim();
  r = r.replace(/V\. Venkata Ramana Reddy( \(Dil Raju\))?/g, "Dil Raju").replace(/\s*\(.*?\)\s*/g, " ").trim();
  if (r.includes(" / ")) r = r.split(" / ").pop()!.trim();
  if (/^film selection/i.test(r) || (a.film && r.toLowerCase().startsWith(a.film.toLowerCase().slice(0, 8)))) return "";
  return r;
}

const SCOPE_LINE = { svc: "Sri Venkateswara Creations", related: "Dil Raju Productions", personal: "Personal honour · Dil Raju" } as const;

/**
 * An award set as a movie poster: festival laurels at the top, the award in big condensed
 * capitals, the film's own title logo, and a billing-block line at the foot.
 */
export function AwardPoster({ set, art, priority = false }: { set: AwardSet; art: PosterArt; priority?: boolean }) {
  const selection = set.awards.every((a) => a.outcome === "Selected");
  const single = set.awards.length === 1 ? set.awards[0] : null;
  const category = single?.category ?? "";
  const label = single && category.toLowerCase().includes(set.label.toLowerCase().replace(/ awards?$/, "")) ? "Honour" : set.label;
  const logo = set.filmSlug ? titleLogos[set.filmSlug] : undefined;
  const big = single ? category : `${set.awards.length} awards`;
  const bigSize = big.length > 34 ? "text-[clamp(15px,7cqw,27px)]" : big.length > 20 ? "text-[clamp(17px,8.6cqw,33px)]" : "text-[clamp(20px,11cqw,42px)]";

  const body = (
    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-[#1c0f08] text-ivory shadow-[0_18px_36px_-20px_rgba(59,26,7,0.55)] [container-type:inline-size]">
      {art ? (
        <Image
          src={art.src}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          style={{ objectPosition: art.focus ?? "50% 30%", ...(art.zoom ? { scale: art.zoom, transformOrigin: art.focus } : {}), ...(art.shift ? { translate: `0 ${art.shift}` } : {}) }}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
      ) : (
        // No photograph (personal honours): a plain temple-saffron poster.
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#e8731a_0%,#a63f0a_45%,#3d1504_100%)]" aria-hidden="true" />
      )}
      <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-black/75 via-black/35 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black via-black/75 to-transparent" aria-hidden="true" />

      {/* Laurels */}
      <div className="absolute inset-x-0 top-[5cqw] flex h-[19cqw] items-center justify-center gap-[1.5cqw] px-[6cqw] text-[#f3d488]">
        <Laurel />
        <div className="min-w-0 text-center leading-[1.05] [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
          <p className="text-[clamp(6px,2.5cqw,10px)] font-bold tracking-[0.3em] uppercase">{selection ? "Official selection" : "Winner"}</p>
          <p className="mt-[0.8cqw] font-title text-[clamp(10px,4.6cqw,18px)] tracking-[0.05em] uppercase">{label}</p>
          <p className="mt-[0.8cqw] text-[clamp(6px,2.4cqw,9.5px)] font-semibold tracking-[0.24em] uppercase">
            {[set.edition, set.year].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Laurel flip />
      </div>

      {/* Title block */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-[6cqw] pb-[5cqw] text-center">
        {single && shortRecipient(single) && (
          <p className="text-[clamp(8px,3.4cqw,13px)] font-semibold tracking-[0.22em] text-ivory/85 uppercase">{shortRecipient(single)}</p>
        )}
        <p className={cn("mt-[1.2cqw] font-title leading-[0.98] tracking-[0.01em] uppercase [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]", bigSize)}>{big}</p>
        {!single && (
          <p className="mt-[2cqw] line-clamp-4 text-[clamp(7px,2.7cqw,10.5px)] leading-[1.45] tracking-[0.06em] text-ivory/75 uppercase">
            {set.awards.map((a, i) => {
              const who = shortRecipient(a);
              return (
                <span key={a.id}>
                  {i > 0 && <span className="text-[#f3d488]/70"> · </span>}
                  <span className="font-semibold text-ivory">{a.category}</span>
                  {who && ` ${who}`}
                </span>
              );
            })}
          </p>
        )}
        <div className="mt-[3.5cqw] flex h-[13cqw] items-center justify-center">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- official title logo, sized by height
            <img src={logo} alt={set.film ?? ""} className="h-full w-auto max-w-[72cqw] object-contain [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.7))]" loading="lazy" decoding="async" />
          ) : (
            <p className="font-display text-[clamp(16px,8.4cqw,32px)] leading-none italic">{set.film ?? "Dil Raju"}</p>
          )}
        </div>
        <p className="mt-[3cqw] border-t border-white/20 pt-[2cqw] text-[clamp(5.5px,2.1cqw,8.5px)] tracking-[0.2em] text-ivory/55 uppercase">
          {SCOPE_LINE[set.scope]}
          {art?.credit && <> · Photo: {art.credit}</>}
        </p>
      </div>
    </div>
  );

  return set.filmSlug ? (
    <Link href={`/films/${set.filmSlug}`} className="group block" aria-label={`${set.film}: ${set.awards.map((a) => a.category).join(", ")} (${set.label} ${set.year ?? ""})`}>
      {body}
    </Link>
  ) : (
    <div className="group">{body}</div>
  );
}
