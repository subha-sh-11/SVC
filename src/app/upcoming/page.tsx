import type { Metadata } from "next";
import Image from "next/image";
import { Showreel } from "@/components/home/Showreel";
import { releaseLabel, statusLabel } from "@/components/films/UpcomingCard";
import { TrailerButton } from "@/components/films/TrailerButton";
import { Reveal } from "@/components/ui/motion";
import { upcoming } from "@/data";
import type { UpcomingProject } from "@/data/types";

export const metadata: Metadata = {
  title: "Upcoming",
  description: "What's next from Sri Venkateswara Creations: Rowdy Janardhana, SVC64, Yellamma, SVC63, DeThadi, and Markandeya from Dil Raju Dreams.",
};

type SlateItem = {
  slug: string;
  /** The official glimpse poster (absent: no poster released yet). */
  poster?: string;
  glimpse?: { id: string; label: string };
  /** Short release line. */
  when: string;
  /** The banner's own mark, when it is not SVC. */
  logo?: { src: string; w: number; h: number; alt: string };
};

/** In release order. Posters are the official glimpse artwork from Dil Raju's / SVC's channels. */
const SLATE: SlateItem[] = [
  { slug: "rowdy-janardhana", poster: "/images/upcoming-posters/rowdy-janardhana.jpg", glimpse: { id: "Q1s_CWfGAHk", label: "Watch title glimpse" }, when: "Apr 2027" },
  { slug: "svc64", when: "14 Jan 2027" },
  {
    slug: "markandeya",
    poster: "/images/upcoming-posters/markandeya.jpg",
    glimpse: { id: "ryWpShUe1Jc", label: "Watch title glimpse" },
    when: "Shivaratri 2027",
    logo: { src: "/brand/dil-raju-dreams-icon.png", w: 191, h: 209, alt: "Dil Raju Dreams" },
  },
  { slug: "yellamma", poster: "/images/upcoming-posters/yellamma.jpg", glimpse: { id: "6SaQ3mey3-A", label: "Watch glimpse" }, when: "5 Mar 2027" },
  { slug: "svc63", poster: "/images/upcoming-posters/svc63.jpg", glimpse: { id: "VGwDSrYUfWE", label: "Watch announcement" }, when: "Eid 2027" },
  { slug: "dethadi", poster: "/images/upcoming-posters/dethadi.jpg", glimpse: { id: "ldJToRagYqs", label: "Watch glimpse" }, when: "To be announced" },
];

const find = (slug: string) => upcoming.find((u) => u.slug === slug);

/** A film on the slate: its poster, then what is known. */
function FilmCard({ item, p }: { item: SlateItem; p: UpcomingProject }) {
  return (
    <article id={p.slug} className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-34px_rgba(59,26,7,0.55)] ring-1 ring-black/[0.06]">
      <div className="relative aspect-video overflow-hidden bg-[#2a1408]">
        {item.poster ? (
          <Image src={item.poster} alt={`${p.title} poster`} fill sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 flex items-end justify-between bg-[linear-gradient(140deg,#f2c230,#e8731a_40%,#9a3c08)] p-8">
            <span className="font-title text-[clamp(4rem,9vw,7.5rem)] leading-[0.8] text-[#fdf1ce]">{p.title}</span>
            <span className="mb-1 text-right text-[max(0.64rem,9px)] font-bold tracking-[0.22em] text-[#fdf1ce]/90 uppercase">
              Title
              <br />
              to be announced
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[max(0.6rem,9px)] font-bold tracking-[0.2em] text-[#9a3c08] uppercase shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e8731a]" aria-hidden="true" />
          {statusLabel(p.status)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[max(0.66rem,9px)] font-bold tracking-[0.22em] text-gold uppercase">{releaseLabel(p.release)}</p>
            <h2 className="display mt-2 text-3xl sm:text-4xl">{p.title}</h2>
          </div>
          {item.logo && (
            // eslint-disable-next-line @next/next/no-img-element -- the banner's own mark
            <img src={item.logo.src} alt={item.logo.alt} width={item.logo.w} height={item.logo.h} className="h-12 w-auto shrink-0" />
          )}
        </div>
        <dl className="mt-5 space-y-1.5 text-[0.92rem]">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-dim">Director</dt>
            <dd className="text-paper">{p.director ?? "To be announced"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-dim">Cast</dt>
            <dd className="text-paper">{p.cast.length ? p.cast.join(", ") : "To be announced"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-dim">Banner</dt>
            <dd className="text-paper">{p.banner ?? "Sri Venkateswara Creations"}</dd>
          </div>
        </dl>
        {item.glimpse && (
          <div className="mt-auto pt-7">
            <TrailerButton youtubeId={item.glimpse.id} title={p.title} label={item.glimpse.label} variant="ghost" />
          </div>
        )}
      </div>
    </article>
  );
}

export default function UpcomingPage() {
  const slate = SLATE.flatMap((item) => {
    const p = find(item.slug);
    return p ? [{ item, p }] : [];
  });
  const more = ["selfish", "akshay-kumar-and-anees-bazmee-project"].map(find).filter((p): p is UpcomingProject => Boolean(p));

  return (
    <div data-header-theme="light">
      {/* The glimpses, one after another */}
      <Showreel films={[]} />

      <div className="theme-light type-classic bg-[#fbf6ee]">
        {/* What's next */}
        <section className="shell pt-24 pb-10">
          <Reveal y={14}>
            <p className="eyebrow flex items-center gap-3">
              Coming soon
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display mt-5 text-5xl sm:text-6xl">
              What&rsquo;s <span className="text-gold-gradient italic">next</span>
            </h1>
          </Reveal>
          {/* Release order, at a glance */}
          <Reveal delay={0.14}>
            <ol className="no-scrollbar mt-10 flex gap-3 overflow-x-auto pb-2">
              {slate.map(({ item, p }) => (
                <li key={p.slug} className="shrink-0">
                  <a href={`#${p.slug}`} className="block rounded-full bg-white px-5 py-3 ring-1 ring-black/[0.06] transition hover:ring-gold">
                    <span className="block text-[max(0.6rem,9px)] font-bold tracking-[0.2em] text-gold uppercase">{item.when}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-paper">{p.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* The slate */}
        <section className="shell pb-24">
          <div className="grid gap-8 md:grid-cols-2">
            {slate.map(({ item, p }, i) => (
              <Reveal key={p.slug} delay={(i % 2) * 0.08}>
                <FilmCard item={item} p={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Also announced */}
        {more.length > 0 && (
          <section className="shell pb-28">
            <Reveal>
              <h2 className="display text-3xl">Also announced</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {more.map((p) => (
                <article key={p.slug} className="rounded-2xl bg-white p-7 ring-1 ring-black/[0.06]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[max(0.62rem,9px)] font-bold tracking-[0.2em] text-gold uppercase">{statusLabel(p.status)}</span>
                    <span className="text-[max(0.62rem,9px)] font-semibold tracking-[0.16em] text-dim uppercase">{releaseLabel(p.release)}</span>
                  </div>
                  <h3 className="display mt-3 text-2xl">{p.title}</h3>
                  <p className="mt-2 text-sm text-mute">{[p.cast.join(", "), p.director && `Directed by ${p.director}`].filter(Boolean).join(" · ")}</p>
                  <p className="mt-1 text-xs text-dim">{p.banner}</p>
                </article>
              ))}
            </div>
            <p className="mt-12 max-w-3xl text-xs leading-relaxed text-dim">
              Planned dates and working titles reflect public announcements and may change. They are not confirmation that filming is complete or that a release will occur on the announced date.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
