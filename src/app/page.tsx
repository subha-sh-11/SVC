import Link from "next/link";
import { HomeOpening } from "@/components/home/HomeOpening";
import { Backbones, type Profile } from "@/components/home/Backbones";
import { team } from "@/data/team";
import { filmPosters } from "@/data/posters";
import { Showreel } from "@/components/home/Showreel";
import { Ventures } from "@/components/home/Ventures";
import { AwardsShowcase } from "@/components/home/AwardsShowcase";
import { Launchpad, type Debut } from "@/components/home/Launchpad";
import { UpcomingPosters } from "@/components/home/UpcomingPosters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { heroSlugs } from "@/data/site";
import { films, getFilm, getFilms } from "@/data";

const DEBUTS: Array<[string, string]> = [
  ["Sukumar", "arya-2004"],
  ["Boyapati Srinu", "bhadra-2005"],
  ["Bhaskar", "bommarillu-2006"],
  ["Vamshi Paidipally", "munna-2007"],
  ["Srikanth Addala", "kotha-bangaru-lokam-2008"],
  ["Vasu Varma", "josh-2009"],
  ["Venu Sriram", "oh-my-friend-2011"],
];

export default function HomePage() {
  const heroFilms = getFilms(heroSlugs);
  const debuts: Debut[] = DEBUTS.map(([director, slug]) => {
    const f = getFilm(slug)!;
    return { director, film: f.title, year: f.year, slug, image: f.image };
  });
  // The pillars of SVC, each with the films they are credited as producer on (first to latest).
  const backbone: Profile[] = team.map((m) => ({
    ...m,
    films: films
      .filter((f) => m.alsoSlugs?.includes(f.slug) || m.match.some((name) => (f.producers ?? "").toLowerCase().includes(name.toLowerCase())))
      .sort((a, b) => (a.releaseDate ?? String(a.year)).localeCompare(b.releaseDate ?? String(b.year)))
      .map((f) => ({ slug: f.slug, title: f.title, year: f.year ?? null, poster: filmPosters[f.slug]?.sm ?? f.image ?? null })),
  }));

  return (
    // The whole home page follows the white hero: see .theme-light in globals.css.
    <div className="theme-light" data-header-theme="light">
      {/* The hero zooms out into Dil Raju's portrait and the banner's story */}
      <HomeOpening />

      {/* Him, and the others who built the banner */}
      <Backbones members={backbone} />

      {/* The reel: the banner's intro, then the films on the way and the films made */}
      <Showreel films={heroFilms} />

      {/* What he started beyond the banner, and the offices he has held */}
      <Ventures />

      {/* National awards: each with the photograph of it being presented */}
      <AwardsShowcase />

      {/* Launchpad */}
      <section className="shell py-28 sm:py-36">
        <SectionHeader
          eyebrow="A launchpad for filmmakers"
          title="First films, first chances."
          italic={["chances."]}
          description="Directors whose first features came through SVC — named examples from the banner's history, not a complete count."
        />
        <Launchpad debuts={debuts} />
      </section>

      {/* Upcoming: on the page itself, stills of the films on the way gliding by */}
      <section id="upcoming" className="relative overflow-hidden py-24 sm:py-32">
        <div className="shell flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={14}>
            <p className="eyebrow flex items-center gap-3">
              Coming soon
            </p>
            <h2 className="display mt-5 text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">
              Stories in <span className="text-gold-gradient italic">development</span>
            </h2>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-balance text-mute">
              Discover announced projects and follow the latest updates from <span className="whitespace-nowrap">Sri Venkateswara Creations.</span>
            </p>
          </Reveal>
          <Reveal y={14} delay={0.15} className="lg:pb-1">
            <Link href="/upcoming" className="text-[0.7rem] font-bold tracking-[0.24em] whitespace-nowrap text-paper uppercase transition-colors hover:text-gold">
              All announcements →
            </Link>
          </Reveal>
        </div>
        {/* The stills run edge to edge; the first starts under the heading */}
        <div className="mt-14 sm:mt-20">
          <UpcomingPosters />
        </div>
        <p className="shell mt-10 text-xs text-dim">Drag to scroll · Planned dates are announcements, not confirmed release facts, and may change.</p>
      </section>

      {/* Closing */}
      <section className="relative overflow-hidden">
        <div className="shell relative py-32 text-center sm:py-44">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,color-mix(in_oklab,var(--color-gold)_10%,transparent),transparent_70%)]" />
          <Reveal y={12}>
            <p className="eyebrow">Sri Venkateswara Creations</p>
          </Reveal>
          <SplitWords as="h2" text="Made by a family, for every family." italicWords={["every", "family."]} className="display mx-auto mt-6 block text-[clamp(1.45rem,5.2vw,4.6rem)] whitespace-nowrap" />
          <Reveal delay={0.3} className="mt-12 flex flex-wrap justify-center gap-4">
            <PrimaryButton href="/films">Explore Our Films</PrimaryButton>
            <GhostButton href="/contact">Get in touch</GhostButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
