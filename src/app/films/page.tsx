import type { Metadata } from "next";
import { FilmsBackdrop } from "@/components/films/FilmsBackdrop";
import { FilmsExplorer } from "@/components/films/FilmsExplorer";
import { films } from "@/data";

export const metadata: Metadata = {
  title: "Films",
  description: "The Sri Venkateswara Creations film catalogue — productions, co-productions, presentations, Telugu versions and related Dil Raju Productions titles.",
};

export default function FilmsPage() {
  return (
    // White, with Seethamma Vakitlo Sirimalle Chettu playing across the top and glowing into it;
    // the title and its tabs sit over the film, and the posters rise up into it.
    <div className="theme-light relative isolate flow-root bg-white" data-header-theme="light">
      <div className="max-sm:hidden">
        <FilmsBackdrop />
      </div>
      {/* The top of the film: the header reads it as dark */}
      <div data-header-theme="dark" aria-hidden="true" className="absolute inset-x-0 top-0 h-[40svh] max-sm:hidden" />
      <section className="shell-narrow relative mt-[40svh] pb-10 max-sm:mt-0 max-sm:pt-7 sm:mt-[46svh]">
        <FilmsExplorer
          films={films}
          onDark
          lead={
            <div className="text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
              <p className="text-[0.95rem] font-medium text-white">Discover all</p>
              <h1 className="mt-0.5 font-display text-[2.4rem] leading-none font-normal tracking-[-0.01em] text-white italic sm:text-[2.9rem]">
                Our films <span className="ml-1 align-middle text-[0.5em] not-italic">&darr;</span>
              </h1>
            </div>
          }
        />
        <p className="mt-20 max-w-3xl text-xs leading-relaxed text-dim">
          Presentations, Telugu-version releases and Dil Raju Productions titles are listed alongside SVC productions but are not counted as SVC original productions.
        </p>
        <p className="mt-3 text-[0.68rem] text-dim">In the background: Seethamma Vakitlo Sirimalle Chettu (2013), from the 2025 re-release trailer.</p>
      </section>
    </div>
  );
}
