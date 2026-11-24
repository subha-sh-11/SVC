import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHero } from "@/components/films/DetailHero";
import { VideoTile } from "@/components/films/TrailerButton";
import { FilmPoster } from "@/components/films/FilmPoster";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { ArrowIcon } from "@/components/ui/Buttons";
import { awardsForFilm, films, getFilm, neighbours } from "@/data";
import { formatDate, hostname, listify } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) return {};
  return {
    title: { absolute: `${film.title} (${film.year}) | Sri Venkateswara Creations` },
    description: film.premise ?? undefined,
    openGraph: film.image ? { images: [{ url: film.image }] } : undefined,
  };
}

export default async function FilmPage({ params }: Props) {
  const { slug } = await params;
  const film = getFilm(slug);
  if (!film) notFound();

  const awards = awardsForFilm(film.slug);
  const { prev, next } = neighbours(film.slug);
  const credits: Array<[string, string | null]> = [
    ["Director", film.director],
    ["Principal cast", film.cast.join(", ") || null],
    ["Music", film.music],
    ["Producers", listify(film.producers)],
    ["Banners", listify(film.banners)],
    ["Credit role", film.role],
    ["Language", film.language],
    ["Release", formatDate(film.releaseDate) ?? String(film.year)],
    ["Also known as", film.altNames.join(", ") || null],
  ];
  const related = films.filter((f) => f.slug !== film.slug && f.director && f.director === film.director).slice(0, 3);

  return (
    <>
      <DetailHero film={film} />

      <section className="shell grid gap-16 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <p className="eyebrow flex items-center gap-3">
              The story
            </p>
          </Reveal>
          {film.premise && <SplitWords as="p" text={film.premise} stagger={0.025} className="display mt-6 block text-[1.6rem] leading-[1.25] sm:text-4xl" />}

          <Reveal delay={0.15} className="mt-16">
            <dl className="divide-y divide-gold/15 border-y border-gold/15">
              {credits
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="text-[max(0.65rem,9px)] font-bold tracking-[0.2em] text-gold uppercase sm:pt-0.5">{k}</dt>
                    <dd className="text-[0.95rem] leading-relaxed text-paper/90">{v}</dd>
                  </div>
                ))}
            </dl>
          </Reveal>
        </div>

        <aside className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28" delay={0.1}>
            <div className="relative aspect-video overflow-hidden rounded-[2px] ring-1 ring-gold/25">
              <FilmPoster src={film.image} title={film.title} year={film.year} sizes="(min-width: 1024px) 40vw, 100vw" className="absolute inset-0" />
            </div>
            {film.gallery.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {film.gallery.map((g) => (
                  <div key={g} className="relative aspect-video overflow-hidden rounded-[2px] ring-1 ring-gold/20">
                    <Image src={g} alt={`${film.title} artwork`} fill sizes="20vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {awards.length > 0 && (
              <div className="mt-10 rounded-[2px] border border-gold/25 bg-gold/[0.04] p-6">
                <p className="eyebrow">Recognition</p>
                <ul className="mt-4 space-y-4">
                  {awards.map((a) => (
                    <li key={a.id} className="border-t border-gold/15 pt-4 first:border-0 first:pt-0">
                      <p className="text-sm font-semibold text-paper">{a.category}</p>
                      <p className="mt-0.5 text-xs text-mute">
                        {a.group}
                        {a.edition ? ` · ${a.edition}` : ""} · {a.outcome}
                      </p>
                      <p className="mt-1 text-xs text-dim">{a.recipient}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/awards" className="mt-6 inline-flex items-center gap-2 text-[max(0.65rem,9px)] font-bold tracking-[0.2em] text-gold uppercase hover:text-gold-bright">
                  All awards <ArrowIcon />
                </Link>
              </div>
            )}
          </Reveal>
        </aside>
      </section>

      {film.videos.length > 0 && (
        <section className="shell py-12">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              Watch
            </p>
            <h2 className="display mt-4 text-5xl">Official videos</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {film.videos.map((v, i) => (
              <Reveal key={v.youtubeId} delay={i * 0.08}>
                <VideoTile youtubeId={v.youtubeId} title={film.title} label={v.label} image={[film.image, ...film.gallery].find((g) => g?.includes(v.youtubeId)) ?? null} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="shell py-16">
          <Reveal>
            <p className="eyebrow">More from {film.director}</p>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/films/${r.slug}`} className="rounded-[2px] border border-gold/25 px-4 py-2 text-sm transition hover:border-gold hover:text-gold">
                {r.title} <span className="tabular-nums tracking-[0.06em] text-xs text-dim">{r.year}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {film.sources.length > 0 && (
        <section className="shell py-10">
          <details className="group border-t border-gold/15 pt-6">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[max(0.65rem,9px)] font-bold tracking-[0.22em] text-mute uppercase hover:text-paper">
              Sources & references ({film.sources.length})
              <span className="text-lg transition group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              {film.sources.map((s) => (
                <li key={s}>
                  <a href={s} target="_blank" rel="noopener noreferrer" className="link-underline break-all text-dim hover:text-paper">
                    {hostname(s)}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {/* Prev / next */}
      <nav aria-label="More films" className="shell mt-10 grid gap-px overflow-hidden rounded-[2px] bg-gold/15 sm:grid-cols-2">
        {[
          { f: prev, dir: "Previous" },
          { f: next, dir: "Next" },
        ].map(({ f, dir }) =>
          f ? (
            <Link key={dir} href={`/films/${f.slug}`} className={`group relative block overflow-hidden bg-ink p-8 sm:p-12 ${dir === "Next" ? "sm:text-right" : ""}`}>
              {f.image && (
                <Image src={f.image} alt="" fill sizes="50vw" className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-30" />
              )}
              <span className="relative text-[max(0.65rem,9px)] font-bold tracking-[0.22em] text-gold uppercase">
                {dir} · {f.year}
              </span>
              <span className="display relative mt-3 block text-4xl transition group-hover:text-gold-bright sm:text-5xl">{f.title}</span>
            </Link>
          ) : (
            <div key={dir} className="bg-ink" />
          ),
        )}
      </nav>
    </>
  );
}
