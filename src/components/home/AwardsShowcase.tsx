"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { GhostButton } from "@/components/ui/Buttons";
import { Reveal } from "@/components/ui/motion";
import { awardPhotos } from "@/data/awardPhotos";

const EASE = [0.22, 1, 0.36, 1] as const;
/** How long each award stays before the next comes in. */
const STAY_MS = 7000;
/** Phones: each award card's turn before the next slides in. */
const PHONE_STAY_MS = 3000;

const photo = (src: string) => awardPhotos.find((p) => p.src === src)!;

/**
 * The National Film Awards for the banner's films, each with the photograph of it being presented.
 * Facts follow awards.ts and awardPhotos.ts (Government of India photographs).
 */
const SHOWCASE = [
  {
    key: "shatamanam",
    edition: "64th National Film Awards",
    film: "Shatamanam Bhavati",
    slug: "shatamanam-bhavati-2017",
    category: "Best Popular Film Providing Wholesome Entertainment",
    medal: "Swarna Kamal",
    banner: "Sri Venkateswara Creations",
    detail: "Award year 2016 · Presented 3 May 2017",
    desc: "Satish Vegesna's family drama, about an elderly couple's attempt to bring their scattered family home, won the Swarna Kamal for Best Popular Film Providing Wholesome Entertainment: the banner's first National Film Award.",
    photo: photo("/images/shatamanam_national_award_2017_godl.jpg"),
  },
  {
    key: "maharshi",
    edition: "67th National Film Awards",
    film: "Maharshi",
    slug: "maharshi-2019",
    category: "Best Popular Film Providing Wholesome Entertainment",
    medal: "Swarna Kamal",
    banner: "Sri Venkateswara Creations",
    detail: "Award year 2019 · Presented 25 October 2021",
    desc: "Vamshi Paidipally's Maharshi, starring Mahesh Babu as a successful businessman who stands with a farming community, won the Swarna Kamal for Best Popular Film Providing Wholesome Entertainment. Raju Sundaram also won Best Choreography for the film.",
    photo: photo("/images/awards/nfa67-maharshi-swarna-kamal.jpg"),
  },
  {
    key: "balagam",
    edition: "71st National Film Awards",
    film: "Balagam",
    slug: "balagam-2023",
    category: "Best Lyrics",
    medal: "Rajat Kamal",
    banner: "Dil Raju Productions",
    detail: "Award year 2023 · Presented 23 September 2025",
    desc: "Venu Yeldandi's Balagam, in which a death brings a divided Telangana family together, won the Rajat Kamal for Best Lyrics for Kasarla Shyam. The film comes from the sister banner Dil Raju Productions.",
    photo: photo("/images/awards/nfa71-balagam-kasarla-shyam.jpg"),
  },
];

/**
 * Phones: each award as a card to swipe through: the photograph of it being presented, its medal,
 * the film and the honour, and the way to the film. A dot per award; one link to all of them.
 */
function PhoneAwards() {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const onScreen = useInView(listRef, { amount: 0.5 });
  // After a swipe, it waits a little before moving on by itself again.
  const heldUntil = useRef(0);
  const hold = () => (heldUntil.current = Date.now() + 6000);
  useEffect(() => {
    if (!onScreen) return;
    const t = window.setInterval(() => {
      const el = listRef.current;
      const first = el?.firstElementChild as HTMLElement | null;
      if (!el || !first || Date.now() < heldUntil.current) return;
      const step = first.offsetWidth + 12;
      const next = (Math.round(el.scrollLeft / step) + 1) % SHOWCASE.length;
      el.scrollTo({ left: next * step, behavior: "smooth" });
    }, PHONE_STAY_MS);
    return () => window.clearInterval(t);
  }, [onScreen]);
  const onScroll = () => {
    const el = listRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    setActive(Math.min(SHOWCASE.length - 1, Math.round(el.scrollLeft / (first.offsetWidth + 12))));
  };
  return (
    <div className="mt-8 sm:hidden">
      <ul ref={listRef} onScroll={onScroll} onPointerDown={hold} onTouchStart={hold} className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2">
        {SHOWCASE.map((s) => (
          <li key={s.key} className="w-[84vw] max-w-[360px] shrink-0 snap-start">
            <article className="h-full overflow-hidden rounded-[20px] bg-white shadow-[0_22px_44px_-28px_rgba(59,26,7,0.55)] ring-1 ring-black/[0.05]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#2a1408]">
                <Image src={s.photo.src} alt={s.photo.alt} fill sizes="84vw" className="object-cover" />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute inset-x-4 bottom-3.5">
                  <span className="block text-[max(0.58rem,9px)] font-bold tracking-[0.2em] text-white/80 uppercase">{s.edition}</span>
                  <span className="mt-1 block font-display text-[1.6rem] leading-tight text-white">{s.film}</span>
                </span>
              </div>
              <div className="p-4 pb-5">
                <p className="text-[0.88rem] leading-snug font-medium text-paper">{s.category}</p>
                <p className="mt-1 text-[0.74rem] text-dim">
                  {s.banner} · {s.detail.split(" · ")[0]}
                </p>
                <Link href={`/films/${s.slug}`} className="mt-3.5 inline-flex items-center gap-1.5 text-[max(0.62rem,9px)] font-bold tracking-[0.18em] text-saffron-deep uppercase">
                  About the film <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
        {SHOWCASE.map((s, i) => (
          <span key={s.key} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-saffron-deep" : "w-1.5 bg-paper/20"}`} />
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link href="/awards" className="inline-flex items-center gap-2 py-1.5 text-[0.7rem] font-bold tracking-[0.24em] text-paper uppercase">
          All recognition <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * The home page's awards: the photograph of each award being presented, with its story beside it.
 * They come in one after another on their own. The whole photograph is always shown, over a soft
 * blur of itself where its shape differs from the frame.
 */
export function AwardsShowcase() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const a = SHOWCASE[active];

  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % SHOWCASE.length), STAY_MS);
    return () => window.clearTimeout(t);
  }, [active, inView]);

  return (
    <section ref={ref} id="awards" aria-roledescription="carousel" aria-label="National Film Awards" className="relative overflow-hidden border-y border-gold/15 bg-ink-900 py-14 max-md:border-t-0 sm:py-32">
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-gold/5 blur-[140px]" />
      <div className="shell relative">
        <Reveal y={12} className="max-sm:hidden">
          <p className="eyebrow flex items-center gap-3">
            National recognition
          </p>
        </Reveal>
        <Reveal y={20} delay={0.05}>
          <h2 className="display mt-5 block text-4xl max-sm:mt-0 max-sm:text-[1.75rem] max-sm:whitespace-nowrap sm:text-5xl">
            Honoured by the <span className="italic text-gold-gradient">nation.</span>
          </h2>
        </Reveal>

        <PhoneAwards />

        <div className="mt-12 grid items-center gap-10 max-sm:hidden lg:mt-16 lg:grid-cols-12 lg:gap-14">
          {/* The photograph */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#2a1408] shadow-[0_30px_60px_-30px_rgba(59,26,7,0.5)] ring-1 ring-black/[0.06]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={a.key}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  {/* A soft, dimmed copy fills the frame; the whole photograph sits on it */}
                  <Image src={a.photo.src} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="scale-110 object-cover opacity-70 blur-2xl" aria-hidden="true" />
                  <Image src={a.photo.src} alt={a.photo.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* One dot per award: the photograph showing is the long one */}
            <div className="mt-5 flex items-center justify-center gap-2.5" role="tablist" aria-label="Choose an award">
              {SHOWCASE.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`${s.film}, ${s.edition}`}
                  onClick={() => setActive(i)}
                  className="group grid h-6 place-items-center px-0.5"
                >
                  <span
                    className={
                      i === active
                        ? "block h-2 w-7 rounded-full bg-gradient-to-r from-[#e8731a] to-[#c2520e] transition-all duration-500"
                        : "block h-2 w-2 rounded-full bg-paper/25 transition-all duration-500 group-hover:bg-paper/45"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Its story, beside it */}
          <div className="lg:col-span-5" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={a.key}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.3 } }}
              >
                <p className="text-[max(0.66rem,9px)] font-bold tracking-[0.24em] text-gold uppercase">{a.edition}</p>
                <h3 className="display mt-3 text-4xl sm:text-5xl">{a.film}</h3>
                <p className="mt-2 text-xs text-dim">
                  {a.banner} · {a.detail}
                </p>
                <p className="mt-6 text-[max(0.66rem,9px)] font-bold tracking-[0.2em] text-paper/70 uppercase">
                  {a.medal} · {a.category}
                </p>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-paper/90">{a.desc}</p>
                <p className="mt-4 text-[0.82rem] leading-relaxed text-mute">
                  {a.photo.caption}, {a.photo.date}.
                </p>
                <p className="mt-2 text-[max(0.66rem,9px)] text-dim">Photo: {a.photo.credit}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <GhostButton href="/awards">Explore all recognition</GhostButton>
              <Link href={`/films/${a.slug}`} className="text-[0.68rem] font-bold tracking-[0.2em] text-paper/70 uppercase transition-colors hover:text-gold">
                About {a.film} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
