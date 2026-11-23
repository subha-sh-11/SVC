import type { Metadata } from "next";
import Image from "next/image";
import { JourneyIntro } from "@/components/journey/JourneyIntro";
import { Timeline } from "@/components/journey/Timeline";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { timeline } from "@/data";
import { posterWall } from "@/data/posters";
import { productionDetail } from "@/data/journeyDetail";

export const metadata: Metadata = {
  title: "Production",
  description:
    "The production journey of Sri Venkateswara Creations, from Dil in 2003 through directors' first films, family dramas, National Film Awards and the films announced next.",
};

/** The production milestones: from Dil (April 2003) on. The distribution years have their own page. */
const PRODUCTION = timeline.filter((m) => Number(/\d{4}/.exec(m.date)?.[0]) >= 2003).map((m) => ({ ...m, detail: productionDetail(m) }));

export default function ProductionPage() {
  // Every SVC production's poster, in release order, for the closing wall.
  const official = posterWall.filter((t) => t.official);
  const wall = official.slice(0, 36);

  return (
    // White, with Playfair headings (type-classic) and the films' own pictures.
    <div className="theme-light type-classic" data-header-theme="light">
      <JourneyIntro
        title={
          <>
            Telling Telugu stories <span className="text-gold-gradient whitespace-nowrap italic">since 2003.</span>
          </>
        }
        text="In April 2003 Sri Venkateswara Creations released its first production, Dil, and the film's success became part of Dil Raju's name. Since then the banner has given directors their first films, made family dramas that became household names, won two National Film Awards and moved into Tamil with Varisu."
        posters={[...official].reverse().map((t) => ({ src: t.sm, position: t.position }))}
      />

      <div className="mt-8">
        <Timeline items={PRODUCTION} label="Production milestones" heading={{ eyebrow: "2003 to 2026", title: "Film by film" }} />
      </div>

      {/* Twenty years: the posters of the films that followed, behind the line. */}
      <section data-header-theme="dark" className="relative mt-24 overflow-hidden bg-[#1c0d05]">
        <div aria-hidden="true" className="grid grid-cols-6 gap-1.5 p-1.5 opacity-70 sm:grid-cols-9 lg:grid-cols-12">
          {wall.map((t) => (
            <div key={t.slug} className="relative aspect-[2/3] overflow-hidden rounded-[3px]">
              <Image src={t.sm} alt="" fill sizes="(min-width: 1024px) 8vw, (min-width: 640px) 11vw, 16vw" className="object-cover" style={{ objectPosition: t.position }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_30%_50%,rgba(28,13,5,0.94),rgba(28,13,5,0.72)_55%,rgba(28,13,5,0.35))]" />
        <div className="shell absolute inset-0 flex flex-col items-start justify-center text-ivory">
          <Reveal y={12}>
            <p className="text-[0.72rem] font-semibold tracking-[0.34em] text-[#f2c230] uppercase">Twenty years and counting</p>
          </Reveal>
          <SplitWords
            as="h2"
            text="April 2023 marked twenty years since Dil."
            italicWords={["twenty", "years"]}
            className="mt-6 block max-w-4xl font-display text-4xl leading-[1.05] font-medium sm:text-6xl"
          />
          <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-4">
            <PrimaryButton href="/films">View the films</PrimaryButton>
            <GhostButton href="/distribution" className="border-white/40! bg-black/25! text-ivory! hover:border-white! hover:text-white!">
              The distribution journey
            </GhostButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
