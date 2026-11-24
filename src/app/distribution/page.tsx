import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReleaseWall } from "@/components/distribution/ReleaseWall";
import { JourneyIntro } from "@/components/journey/JourneyIntro";
import { Timeline } from "@/components/journey/Timeline";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { distribution } from "@/data";
import { distributionJourney } from "@/data/distributionJourney";
import { distributionDetail } from "@/data/journeyDetail";
import { releasePoster } from "@/data/releasePoster";

export const metadata: Metadata = {
  title: "Distribution",
  description:
    "The distribution journey of Sri Venkateswara Film Distributors, from Pelli Pandiri and Nizam in 1999 to pan-India releases across the Telugu states, with every recorded release.",
};

export default function DistributionPage() {
  // Behind the opening: the other banners' films it released, newest first.
  const collage = [...distribution]
    .reverse()
    .filter((r) => !r.filmSlug)
    .flatMap((r) => releasePoster(r) ?? []);

  // Posters from every era, in release order, for the closing wall.
  const withPosters = distribution.flatMap((r) => {
    const p = releasePoster(r);
    return p ? [{ ...p, key: `${r.film}-${r.year}` }] : [];
  });
  const step = withPosters.length / 36;
  const wall = Array.from({ length: Math.min(36, withPosters.length) }, (_, i) => withPosters[Math.floor(i * step)]);

  return (
    <div className="theme-light type-classic bg-[#fffdf9]" data-header-theme="light">
      {/* Phones: a clean top, then the eras and every release as boards */}
      <section className="shell pt-7 pb-6 sm:hidden">
        <h1 className="font-display text-[2.2rem] leading-none text-[#2a1408]">Distribution</h1>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-[#8a6a52]">Bringing films to Telugu screens since 1999, its own and other banners&rsquo;. Tap an era for its story.</p>
      </section>
      <div className="max-sm:hidden">
      <JourneyIntro
        title={
          <>
            Bringing films to Telugu screens <span className="text-gold-gradient whitespace-nowrap italic">since 1999.</span>
          </>
        }
        text={
          <>
            Before Dil, there was distribution. Sri Venkateswara Film Distributors began in the Nizam territory in 1999, and releasing films, its own and other
            banners&rsquo;, has stayed at the heart of the business ever since.
          </>
        }
        posters={collage}
      />
      </div>

      <div className="mt-8 max-sm:mt-0">
        <Timeline items={distributionJourney.map((m) => ({ ...m, detail: distributionDetail(m) }))} label="Distribution milestones" heading={{ eyebrow: "1997 to 2026", title: "Era by era" }} />
      </div>

      {/* Every release */}
      <section id="releases" className="shell scroll-mt-28 pt-24 pb-28 max-sm:pt-14 max-sm:pb-6">
        <Reveal>
          <h2 className="display text-3xl max-sm:text-[1.75rem] sm:text-4xl">Every release</h2>
        </Reveal>
        <div className="mt-8 max-sm:mt-5">
          <ReleaseWall records={distribution} />
        </div>
        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-dim max-sm:mt-10">
          This index records public distribution relationships, not production credits. Original films belong to their credited producers. Posters marked &ldquo;SVC&rdquo; are the banner&rsquo;s own films and open their pages; territories are shown as reported. Posters of other banners&rsquo; films are shown for identification and belong to their rights holders.
        </p>
      </section>

      {/* The films it brought to the screen, behind the line. */}
      {/* Phones: the ways on, plainly */}
      <nav aria-label="Next" className="shell mt-4 flex flex-col items-start gap-4 sm:hidden">
        <Link href="/production" className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.22em] text-[#2a1408] uppercase">The production journey <span aria-hidden="true">&rarr;</span></Link>
        <Link href="/contact" className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.22em] text-[#2a1408] uppercase">Distribution enquiries <span aria-hidden="true">&rarr;</span></Link>
      </nav>
      <section data-header-theme="dark" className="relative overflow-hidden bg-[#1c0d05] max-sm:hidden">
        <div aria-hidden="true" className="grid grid-cols-6 gap-1.5 p-1.5 opacity-70 sm:grid-cols-9 lg:grid-cols-12">
          {wall.map((t) => (
            <div key={t.key} className="relative aspect-[2/3] overflow-hidden rounded-[3px]">
              <Image src={t.src} alt="" fill sizes="(min-width: 1024px) 8vw, (min-width: 640px) 11vw, 16vw" className="object-cover" style={{ objectPosition: t.position }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_30%_50%,rgba(28,13,5,0.94),rgba(28,13,5,0.72)_55%,rgba(28,13,5,0.35))]" />
        <div className="shell absolute inset-0 flex flex-col items-start justify-center text-ivory">
          <Reveal y={12}>
            <p className="text-[0.72rem] font-semibold tracking-[0.34em] text-[#f2c230] uppercase">From Nizam to both Telugu states</p>
          </Reveal>
          <SplitWords
            as="h2"
            text="Twenty-seven years of films on Telugu screens."
            italicWords={["Telugu", "screens."]}
            className="mt-6 block max-w-4xl font-display text-4xl leading-[1.05] font-medium sm:text-6xl"
          />
          <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-4">
            <PrimaryButton href="/production">The production journey</PrimaryButton>
            <GhostButton href="/contact" className="border-white/40! bg-black/25! text-ivory! hover:border-white! hover:text-white!">
              Distribution enquiries
            </GhostButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
