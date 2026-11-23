import type { Metadata } from "next";
import { AwardsExplorer } from "@/components/awards/AwardsExplorer";
import { AwardStats } from "@/components/awards/AwardStats";
import { AwardsHero } from "@/components/awards/AwardsHero";
import { Reveal } from "@/components/ui/motion";
import { awards } from "@/data";
import { awardPhotos } from "@/data/awardPhotos";

export const metadata: Metadata = {
  title: "Awards",
  description: "National Film Awards, Nandi, Filmfare, Gaddar, SIIMA and festival recognition for Sri Venkateswara Creations films and their creative teams.",
};

export default function AwardsPage() {
  const wins = awards.filter((a) => a.outcome !== "Selected").length;
  const films = new Set(awards.filter((a) => a.filmSlug).map((a) => a.filmSlug)).size;
  // Over the film: Dil Raju receiving from the Vice President (2021) and from President Pranab
  // Mukherjee (2017), and President Droupadi Murmu presenting for Balagam (2025).
  const STAGE = ["/images/awards/nfa67-maharshi-swarna-kamal.jpg", "/images/shatamanam_national_award_2017_godl.jpg", "/images/awards/nfa71-balagam-kasarla-shyam.jpg"];
  const stage = STAGE.flatMap((src) => awardPhotos.filter((p) => p.src === src));

  return (
    // White, with the photographs carrying the colour.
    // Headings in the Playfair serif (type-classic), text in the sans, by importance.
    <div className="theme-light type-classic" data-header-theme="light">
      {/* Dil Raju receiving the Swarna Kamal plays across the top; the National Awards on stage rise over it */}
      <AwardsHero photos={stage} />

      {/* The register's numbers: each opens the wall of award photographs. */}
      <section className="shell grid items-end gap-12 py-28 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal y={12}>
            <p className="eyebrow flex items-center gap-3">
              The register
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display mt-4 text-4xl sm:text-5xl">
              Recognition, <span className="text-gold-gradient italic">by the record.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-lg text-[0.85rem] leading-relaxed text-dim">
              Producer and film-level awards are distinct from awards won by cast and crew for their work in a film. Festival selections are listed as selections, not wins.
            </p>
          </Reveal>
        </div>
        <div className="border-t border-gold/15 pt-8 lg:col-span-6 lg:border-t-0 lg:pt-0">
          <AwardStats
            stats={[
              { value: awards.length, label: "Recognition records" },
              { value: wins, label: "Wins & announced winners" },
              { value: films, label: "Films recognised" },
            ]}
          />
        </div>
      </section>

      <section className="shell pb-10">
        <AwardsExplorer awards={awards} />
        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-dim">
          A source-limited register, not an exhaustive census of every nomination or honour. Dil Raju Productions and personal honours are labelled separately from Sri Venkateswara Creations recognition. Photographs are credited where shown.
        </p>
      </section>
    </div>
  );
}
