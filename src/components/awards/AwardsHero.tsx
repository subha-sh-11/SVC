"use client";

import Image from "next/image";
import Link from "next/link";
import { AmbientBackdrop, screenPixels, slowConnection } from "@/components/ui/AmbientBackdrop";
import { Reveal } from "@/components/ui/motion";
import type { AwardPhoto } from "@/data/awardPhotos";

const BASE = "/video/awards/dil-raju-maharshi";

/**
 * 1080p (720p on phones and slow connections) first; on large screens the 1080p broadcast,
 * carefully upscaled and sharpened to 1440p, takes over (no 4K of this footage exists).
 */
function pick() {
  const slow = slowConnection();
  const px = screenPixels();
  return { first: slow || px < 1100 ? `${BASE}-720.mp4` : `${BASE}-1080.mp4`, uhd: !slow && px >= 2600 ? `${BASE}-1440.mp4` : undefined };
}

/** A photograph of a National Film Award being presented. */
function StageCard({ p, priority }: { p: AwardPhoto; priority: boolean }) {
  const body = (
    <>
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-[#f3ebdf] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] ring-1 ring-black/5">
        <Image
          src={p.src}
          alt={p.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          style={{ objectPosition: p.focus ?? "50% 50%" }}
          className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-4 text-[0.6rem] leading-relaxed font-bold tracking-[0.16em] text-gold uppercase">{p.award}</p>
      <p className="mt-1.5 text-[0.92rem] leading-snug font-medium text-paper">{p.caption}</p>
      <p className="mt-1.5 text-xs text-dim">
        {p.film && <span className="font-semibold text-mute transition-colors group-hover:text-gold">{p.film}</span>}
        {p.film && " · "}
        {p.date}
      </p>
    </>
  );
  return p.filmSlug ? (
    <Link href={`/films/${p.filmSlug}`} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group">{body}</div>
  );
}

/**
 * The page's opening, laid out like the Films page: Dil Raju receiving the banner's Swarna Kamal
 * for Maharshi plays across the top (Doordarshan's footage), its colours glowing out below it and
 * fading into the white page; the title sits over the film, and the National Film Awards being
 * presented, Dil Raju with the President and the Vice President among them, rise up into it.
 */
export function AwardsHero({ photos }: { photos: AwardPhoto[] }) {
  return (
    <section className="relative isolate flow-root">
      <AmbientBackdrop pick={pick} poster={`${BASE}-poster.jpg`} focus="60% 35%" shade={0.25} />
      {/* The top of the film: the header reads it as dark */}
      <div data-header-theme="dark" aria-hidden="true" className="absolute inset-x-0 top-0 h-[56svh]" />

      <div className="shell relative mt-[56svh] pb-24 sm:mt-[62svh] sm:pb-28">
        {/* The film says it: the page's title is for screen readers and search only */}
        <h1 className="sr-only">Awards &amp; honours</h1>

        {/* The National Film Awards, on stage */}
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p, i) => (
            <Reveal key={p.src} delay={0.15 + i * 0.08}>
              <StageCard p={p} priority={i < 3} />
            </Reveal>
          ))}
        </div>
        <p className="mt-12 text-[0.68rem] leading-relaxed text-dim">
          In the background: Dil Raju receives the Swarna Kamal for Maharshi from Vice President M. Venkaiah Naidu, 67th National Film Awards, New Delhi, 25 October 2021 (footage: Doordarshan National, Prasar Bharati). Photographs: President&rsquo;s Secretariat and PIB, Government of India.
        </p>
      </div>
    </section>
  );
}
