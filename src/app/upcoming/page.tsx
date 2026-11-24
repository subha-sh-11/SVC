import type { Metadata } from "next";
import Image from "next/image";
import { Showreel } from "@/components/home/Showreel";
import { releaseLabel, statusLabel } from "@/components/films/UpcomingCard";
import { TrailerButton } from "@/components/films/TrailerButton";
import { Reveal } from "@/components/ui/motion";
import { PinBoard, twoColumns } from "@/components/ui/Pins";
import { PinPlay } from "@/components/ui/PinPlay";
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

type PinPhoto = { src: string; alt: string; focus: string; director?: boolean };
/**
 * Phones: each pin's picture. The hero, cut from the film's glimpse poster without its lettering;
 * where no poster shows the hero, the director. SVC64 has no poster and no free photo of its
 * director, so it shows its hero. Photos not from the studio are credited under the board.
 */
const PIN_PHOTOS: Record<string, PinPhoto> = {
  "rowdy-janardhana": { src: "/images/upcoming-pins/rowdy-janardhana.jpg", alt: "Vijay Deverakonda in the Rowdy Janardhana poster", focus: "60% 30%" },
  svc64: { src: "/images/upcoming-pins/svc64.jpg", alt: "Ravi Teja", focus: "45% 30%" },
  markandeya: { src: "/images/upcoming-pins/markandeya.jpg", alt: "Vikranth in the Markandeya poster", focus: "78% 35%" },
  yellamma: { src: "/images/upcoming-pins/yellamma.jpg", alt: "Director Venu Yeldandi", focus: "50% 20%", director: true },
  svc63: { src: "/images/upcoming-pins/svc63.jpg", alt: "Salman Khan", focus: "55% 30%" },
  dethadi: { src: "/images/upcoming-pins/dethadi.jpg", alt: "Ashish in the DeThadi poster", focus: "60% 15%" },
};
/** Phones: each pin's height per unit of width, in slate order. */
const SHAPES = [1.3, 1.05, 1.25, 1, 1.2, 1.1];

/**
 * Phones: the slate as a Pinterest-style board. Each film is a pin: its hero (or director) in a soft,
 * warm film tone (with a play button for the glimpse), where it stands, when it is due, who is in it. The projects
 * also announced follow as plain pins.
 */
function PhoneSlate({ slate, more }: { slate: { item: SlateItem; p: UpcomingProject }[]; more: UpcomingProject[] }) {
  type Pin = { kind: "film"; item: SlateItem; p: UpcomingProject; ratio: number } | { kind: "more"; p: UpcomingProject };
  const pins: Pin[] = [...slate.map(({ item, p }, i) => ({ kind: "film" as const, item, p, ratio: SHAPES[i % SHAPES.length] })), ...more.map((p) => ({ kind: "more" as const, p }))];
  const [left, right] = twoColumns(pins, (pin) => (pin.kind === "film" ? pin.ratio + 0.5 : 0.75));
  const render = (pin: Pin) => {
    const { p } = pin;
    if (pin.kind === "more")
      return (
        <article key={p.slug} className="rounded-[16px] bg-[#f6efe6] p-4">
          <p className="text-[max(0.56rem,9px)] font-bold tracking-[0.18em] text-[#c2520e] uppercase">Also announced · {statusLabel(p.status)}</p>
          <h3 className="mt-2 font-display text-[1.05rem] leading-tight text-[#2a1408]">{p.title}</h3>
          <p className="mt-1.5 text-[0.7rem] leading-snug text-[#8a6a52]">{[p.cast.join(", "), p.director && `Directed by ${p.director}`].filter(Boolean).join(" · ")}</p>
        </article>
      );
    const { item, ratio } = pin;
    const photo = PIN_PHOTOS[p.slug];
    const people = [p.cast.slice(0, 2).join(", "), p.director && `Dir. ${p.director}${photo?.director ? " (pictured)" : ""}`].filter(Boolean).join(" · ");
    return (
      <article key={p.slug} id={`${p.slug}-pin`}>
        <div className="relative isolate overflow-hidden rounded-[16px] bg-[#2a1408] shadow-[0_10px_24px_-16px_rgba(59,26,7,0.55)]" style={{ aspectRatio: `1 / ${ratio}` }}>
          {photo ? (
            <>
              <Image src={photo.src} alt={photo.alt} fill sizes="48vw" className="pin-photo object-cover" style={{ objectPosition: photo.focus }} />
              <span aria-hidden="true" className="pin-tone" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(150deg,#f2c230,#e8731a_45%,#9a3c08)] p-3">
              <span className="font-title text-[2.4rem] leading-[0.85] text-[#fdf1ce]">{p.title}</span>
              <span className="mt-1.5 text-[max(0.56rem,9px)] font-bold tracking-[0.18em] text-[#fdf1ce]/90 uppercase">Title to be announced</span>
            </div>
          )}
          {item.glimpse && <PinPlay youtubeId={item.glimpse.id} title={p.title} label={item.glimpse.label} />}
        </div>
        <h3 className="mt-2 px-0.5 font-display text-[1.05rem] leading-tight text-[#2a1408]">{p.title}</h3>
        <p className="mt-0.5 px-0.5 text-[0.68rem] font-semibold text-[#c2520e]">{item.when}</p>
        {people && <p className="mt-0.5 line-clamp-2 px-0.5 text-[0.68rem] leading-snug text-[#8a6a52]">{people}</p>}
      </article>
    );
  };
  return (
    <div className="sm:hidden">
      <PinBoard className="mt-7" left={left.map(render)} right={right.map(render)} />
      <p className="mt-6 text-[0.62rem] leading-relaxed text-dim">
        Photos, cropped: Ravi Teja by{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Ravi_Teja_in_Dhamaka_promotions_2022_(cropped).png" className="underline">
          People Media Factory
        </a>{" "}
        (CC BY 3.0); Venu Yeldandi by{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Venu_Yeldandi_was_Felicitated_by_TSFDC_Chairman_Anil_Kurmachalam_on_his_Directorial_Success_Balagam.jpg" className="underline">
          Batthini Vinay Kumar Goud
        </a>{" "}
        (CC0), via Wikimedia Commons.
      </p>
    </div>
  );
}

/** A film on the slate: its poster, then what is known. */
function FilmCard({ item, p }: { item: SlateItem; p: UpcomingProject }) {
  return (
    <article id={p.slug} className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-34px_rgba(59,26,7,0.55)] ring-1 ring-black/[0.06]">
      <div className="relative aspect-video overflow-hidden bg-[#2a1408]">
        {item.poster ? (
          <Image src={item.poster} alt={`${p.title} poster`} fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 flex items-end justify-between bg-[linear-gradient(140deg,#f2c230,#e8731a_40%,#9a3c08)] p-8">
            <span className="font-title text-[clamp(3.5rem,4.6vw,4.8rem)] leading-[0.8] text-[#fdf1ce]">{p.title}</span>
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
      <div className="max-sm:hidden">
        <Showreel films={[]} fadeTo="#ffffff" />
      </div>

      <div className="theme-light type-classic bg-[#fbf6ee]">
        {/* What's next */}
        <section className="shell-narrow pt-24 pb-10 max-sm:pt-7 max-sm:pb-2">
          <Reveal y={14}>
            <p className="eyebrow flex items-center gap-3 max-sm:hidden">
              Coming soon
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display mt-5 text-5xl max-sm:mt-0 max-sm:text-[2.4rem] sm:text-6xl">
              What&rsquo;s <span className="text-gold-gradient italic">next</span>
            </h1>
          </Reveal>
          {/* Release order, at a glance (wide screens; phones go straight to the board) */}
          <Reveal delay={0.14} className="max-sm:hidden">
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
        <section className="shell-narrow pb-24 max-sm:pb-10">
          <PhoneSlate slate={slate} more={more} />
          <div className="grid gap-8 max-sm:hidden md:grid-cols-2 xl:grid-cols-3">
            {slate.map(({ item, p }, i) => (
              <Reveal key={p.slug} delay={(i % 2) * 0.08}>
                <FilmCard item={item} p={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Also announced */}
        {more.length > 0 && (
          <section className="shell-narrow pb-28 max-sm:pb-8">
            <Reveal className="max-sm:hidden">
              <h2 className="display text-3xl">Also announced</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 max-sm:hidden md:grid-cols-2">
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
            <p className="mt-12 max-w-3xl text-xs leading-relaxed text-dim max-sm:mt-0">
              Planned dates and working titles reflect public announcements and may change. They are not confirmation that filming is complete or that a release will occur on the announced date.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
