import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { nav, site, socials } from "@/data/site";
import { Marquee } from "@/components/ui/motion";
import { films } from "@/data";
import { titleLogos } from "@/data/posters";
import { cn } from "@/lib/utils";
import { whiteInk } from "@/lib/titleLogo";

/** SVC productions, in release order, shown by their official title logos. */
const reel = films.filter((f) => f.category === "core" && titleLogos[f.slug]).map((f) => ({ slug: f.slug, title: f.title, logo: titleLogos[f.slug] }));

const links = nav;

/** The social networks' marks, drawn simply in the text colour. */
export const SOCIAL_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4.6v-7h2.4l.4-2.8h-2.8V10.4c0-.8.3-1.4 1.4-1.4h1.5V6.5c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7v2.1H9.8V15h2.4v7H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.6 7.2a2.8 2.8 0 0 0-2-2C18.9 4.7 12 4.7 12 4.7s-6.9 0-8.6.5a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM9.8 15.1V8.9l5.7 3.1-5.7 3.1Z" />
    </svg>
  ),
  Telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.4 3.6 2.9 10.7c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.8ZM9.6 14l8.6-7.8c.4-.3-.1-.5-.6-.2L7.1 12.9" />
    </svg>
  ),
};

/**
 * The footer, on white: the films' title logos in their own colours, then Lord Venkateswara (the
 * banner's namesake) standing at the foot on the left, and on the right the banner, its networks,
 * a word about it, the way round the site and the small print.
 */
export function Footer() {
  return (
    <footer data-header-theme="light" className="theme-light relative mt-32 overflow-hidden bg-white text-paper">
      {/* The films' title logos, running straight across on white */}
      <div className="py-9 sm:py-10">
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

      <div className="shell flex flex-col-reverse items-center gap-10 pt-10 md:flex-row md:items-end md:justify-between md:gap-16 md:pt-16">
        {/* Lord Venkateswara, standing on the footer's foot, whole */}
        <div className="relative w-[min(58vw,250px)] shrink-0 md:w-[clamp(220px,24vw,340px)]">
          <div aria-hidden="true" className="absolute inset-x-[-25%] top-[8%] bottom-0 rounded-full bg-[radial-gradient(closest-side,rgba(242,194,48,0.32),rgba(232,115,26,0.12)_55%,transparent)] blur-2xl" />
          <Image
            src="/brand/svc-deity.png"
            alt="Lord Venkateswara"
            width={606}
            height={906}
            sizes="(min-width: 768px) 24vw, 58vw"
            className="relative block h-auto w-full drop-shadow-[0_18px_30px_rgba(122,60,8,0.25)]"
          />
        </div>

        {/* The banner, and the way round */}
        <div className="flex max-w-[42rem] flex-col items-center text-center md:items-end md:pb-14 md:text-right">
          <Link href="/" aria-label="Sri Venkateswara Creations, home" className="flex flex-col items-center md:items-end">
            <span aria-hidden="true" className="svc-mark svc-mark--light block aspect-[2003/736] h-12 sm:h-14" />
            <span className="mt-2 text-[0.62rem] font-bold tracking-[0.34em] text-paper/75 uppercase">Sri Venkateswara Creations</span>
          </Link>

          <ul className="mt-6 flex items-center gap-5" aria-label="Follow SVC">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="block h-7 w-7 text-paper transition-colors hover:text-gold [&>svg]:h-full [&>svg]:w-full">
                  {SOCIAL_ICONS[s.label] ?? s.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-[36rem] text-[0.9rem] leading-relaxed text-paper/85">
            Sri Venkateswara Creations is the film banner of producers Dil Raju and Shirish, based in Hyderabad. It began in distribution in 1999 and
            moved into production with <em>Dil</em> in 2003, followed by <em>Arya</em>, <em>Bommarillu</em>, <em>Fidaa</em>, <em>Maharshi</em> and{" "}
            <em>Sankranthiki Vasthunam</em>, among many others. Two of its films, <em>Shatamanam Bhavati</em> and <em>Maharshi</em>, have won the
            National Film Award for Best Popular Film Providing Wholesome Entertainment. Coming next: <em>Rowdy Janardhana</em>, <em>Yellamma</em> and{" "}
            <em>SVC63</em> with Salman Khan.
          </p>

          <nav aria-label="Footer" className="mt-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.8rem] font-semibold tracking-[0.05em] text-paper uppercase md:flex-nowrap md:justify-end md:gap-x-3">
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

          <p className="mt-6 text-[0.8rem] text-paper/80">
            © {new Date().getFullYear()} {site.name} · All rights reserved
          </p>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-paper/80">
            Office: {site.base}
            <br />
            Production, distribution and media enquiries:{" "}
            <Link href="/contact" className="underline underline-offset-4 transition-colors hover:text-gold">
              get in touch
            </Link>
          </p>
          <p className="mt-4 text-[0.7rem] text-dim">Film titles, artwork and trailers belong to their respective rights holders.</p>
        </div>
      </div>
    </footer>
  );
}
