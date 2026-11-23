import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/motion";
import { copy } from "@/data/site";
import { team } from "@/data/team";

export const metadata: Metadata = {
  title: "About",
  description: copy.aboutShort,
};

/** The family of banners, by their own marks where they have one. */
const FAMILY = [
  { name: "Sri Venkateswara Creations", logo: { src: "/brand/svc-deity.png", w: 606, h: 906 }, href: "/films" },
  { name: "Dil Raju Dreams", logo: { src: "/brand/dil-raju-dreams.png", w: 298, h: 258 }, href: "https://www.dilrajudreams.com/", external: true },
  { name: "Lorven AI Studio", logo: { src: "/brand/lorven-ai-studio.png", w: 298, h: 62 }, href: "/#venture-lorven" },
];

/** About, kept simple: who we are, in a few numbers, the people, the family of banners. */
export default function AboutPage() {
  return (
    <div className="theme-light type-classic bg-white" data-header-theme="light">
      {/* Who we are */}
      <section className="shell grid items-center gap-12 pt-36 pb-20 sm:pt-44 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal y={14}>
            <p className="eyebrow flex items-center gap-3">
              About SVC
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display mt-5 text-5xl leading-[1.02] sm:text-6xl">
              Stories for the whole <span className="text-gold-gradient italic">family.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-7 text-[1.05rem] leading-relaxed text-mute">{copy.aboutShort}</p>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-mute">{copy.aboutLong}</p>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mx-auto w-[min(60vw,260px)] lg:col-span-4 lg:col-start-9 lg:w-full lg:max-w-[300px]">
          <Image src="/brand/svc-deity.png" alt="Lord Venkateswara, the banner's namesake" width={606} height={906} priority className="h-auto w-full" />
        </Reveal>
      </section>

      {/* The people */}
      <section className="shell py-24">
        <Reveal>
          <h2 className="display text-3xl sm:text-4xl">The people</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f1e4cf]">
                <Image src={m.image} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 22vw, 46vw" className="object-cover object-[50%_25%]" />
              </div>
              <p className="display mt-4 text-xl">{m.name}</p>
              <p className="mt-1 text-[max(0.62rem,9px)] font-bold tracking-[0.2em] text-gold uppercase">{m.role}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The family of banners */}
      <section className="shell pb-28">
        <Reveal>
          <h2 className="display text-3xl sm:text-4xl">The family of banners</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {FAMILY.map((f, i) => {
            const card = (
              <span className="flex h-36 items-center justify-center rounded-2xl bg-[#fbf6ee] p-6 ring-1 ring-black/5 transition-transform duration-500 hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- each banner's own mark, sized by height */}
                <img src={f.logo.src} alt={f.name} width={f.logo.w} height={f.logo.h} className={f.logo.w / f.logo.h > 2 ? "h-10 w-auto" : "h-24 w-auto"} />
              </span>
            );
            return (
              <Reveal key={f.name} delay={i * 0.06}>
                {f.external ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className="block">
                    {card}
                  </a>
                ) : (
                  <Link href={f.href} className="block">
                    {card}
                  </Link>
                )}
                <p className="mt-3 text-center text-sm font-semibold text-paper">{f.name}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
