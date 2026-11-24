import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { nav, site, socials } from "@/data/site";
import { Marquee } from "@/components/ui/motion";
import { films } from "@/data";
import { titleLogos } from "@/data/posters";
import { cn } from "@/lib/utils";
import { whiteInk } from "@/lib/titleLogo";
import { SOCIAL_ICONS } from "@/components/ui/SocialIcons";

/** SVC productions, in release order, shown by their official title logos. */
const reel = films.filter((f) => f.category === "core" && titleLogos[f.slug]).map((f) => ({ slug: f.slug, title: f.title, logo: titleLogos[f.slug] }));

const links = nav;

/**
 * The footer, on white: the films' title logos in their own colours, then Lord Venkateswara (the
 * banner's namesake) standing at the foot on the left, and on the right the banner, its networks,
 * a word about it, the way round the site and the small print.
 */
export function Footer() {
  return (
    <footer data-header-theme="light" className="theme-light relative mt-10 overflow-hidden bg-white text-paper sm:mt-32">
      {/* The films' title logos, running straight across on white */}
      <div className="py-6 sm:py-10">
        <Marquee speed={1.1}>
          {reel.map((f) => (
            // eslint-disable-next-line @next/next/no-img-element -- official title logo, sized by height
            <img
              key={f.slug}
              src={f.logo}
              alt={f.title}
              loading="lazy"
              decoding="async"
              className={cn("mx-9 h-11 w-auto max-w-[210px] object-contain sm:mx-12 sm:h-14 sm:max-w-[260px]", whiteInk(f.slug))}
            />
          ))}
        </Marquee>
      </div>

      <div className="shell flex flex-row items-end justify-between gap-4 pt-6 md:gap-16 md:pt-16">
        {/* Lord Venkateswara, standing on the footer's foot, whole */}
        <div className="relative w-[min(34vw,170px)] shrink-0 md:w-[clamp(220px,24vw,340px)]">
          <div aria-hidden="true" className="absolute inset-x-[-25%] top-[8%] bottom-0 rounded-full bg-[radial-gradient(closest-side,rgba(242,194,48,0.32),rgba(232,115,26,0.12)_55%,transparent)] blur-2xl" />
          <Image
            src="/brand/svc-deity.png"
            alt="Lord Venkateswara"
            width={606}
            height={906}
            sizes="(min-width: 768px) 24vw, 34vw"
            className="relative block h-auto w-full drop-shadow-[0_18px_30px_rgba(122,60,8,0.25)]"
          />
        </div>

        {/* The banner, and the way round */}
        <div className="flex min-w-0 max-w-[42rem] flex-col items-end pb-8 text-right md:pb-14">
          <Link href="/" aria-label="Sri Venkateswara Creations, home" className="flex flex-col items-end">
            <span aria-hidden="true" className="svc-mark svc-mark--light block aspect-[2003/736] h-10 sm:h-14" />
            <span className="mt-2 text-[max(0.62rem,9px)] font-bold tracking-[0.2em] text-paper/75 uppercase sm:tracking-[0.34em]">Sri Venkateswara Creations</span>
          </Link>

          <ul className="mt-4 flex items-center gap-3.5 sm:mt-6 sm:gap-5" aria-label="Follow SVC">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="block h-[18px] w-[18px] text-paper transition-colors hover:text-gold sm:h-7 sm:w-7 [&>svg]:h-full [&>svg]:w-full">
                  {SOCIAL_ICONS[s.label] ?? s.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 hidden max-w-[36rem] text-[0.9rem] leading-relaxed text-paper/85 sm:block">
            Sri Venkateswara Creations is the film banner of producers Dil Raju and Shirish, based in Hyderabad. It began in distribution in 1999 and
            moved into production with <em>Dil</em> in 2003, followed by <em>Arya</em>, <em>Bommarillu</em>, <em>Fidaa</em>, <em>Maharshi</em> and{" "}
            <em>Sankranthiki Vasthunam</em>, among many others. Two of its films, <em>Shatamanam Bhavati</em> and <em>Maharshi</em>, have won the
            National Film Award for Best Popular Film Providing Wholesome Entertainment. Coming next: <em>Rowdy Janardhana</em>, <em>Yellamma</em> and{" "}
            <em>SVC63</em> with Salman Khan.
          </p>

          <nav aria-label="Footer" className="mt-5 max-md:hidden sm:mt-6">
            <ul className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-[0.72rem] font-semibold tracking-[0.05em] text-paper uppercase sm:gap-x-4 sm:gap-y-2 sm:text-[0.8rem] md:flex-nowrap md:gap-x-3">
              {links.map((n, i) => (
                <Fragment key={n.href}>
                  {i > 0 && (
                    <li aria-hidden="true" className="hidden text-paper/30 md:block">
                      |
                    </li>
                  )}
                  <li>
                    <Link href={n.href} className="transition-colors hover:text-gold">
                      {n.label}
                    </Link>
                  </li>
                </Fragment>
              ))}
            </ul>
          </nav>

          <p className="mt-5 text-[0.7rem] text-paper/70 sm:mt-6 sm:text-[0.8rem] sm:text-paper/80">
            © {new Date().getFullYear()} {site.name} · All rights reserved
          </p>
          <p className="mt-3 text-[0.72rem] leading-relaxed text-paper/80 max-md:hidden sm:text-[0.8rem]">
            Office: {site.base}
            <br />
            Production, distribution and media enquiries:{" "}
            <Link href="/contact" className="underline underline-offset-4 transition-colors hover:text-gold">
              get in touch
            </Link>
          </p>
          <p className="mt-4 text-[0.7rem] text-dim max-md:hidden">Film titles, artwork and trailers belong to their respective rights holders.</p>
        </div>
      </div>
    </footer>
  );
}
