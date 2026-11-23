import Image from "next/image";
import { cn, initials } from "@/lib/utils";

/**
 * Film artwork. When no approved image exists for a title, renders a
 * typographic title card instead of a placeholder photo.
 */
export function FilmPoster({
  src,
  title,
  year,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
  className,
  imgClassName,
}: {
  src: string | null;
  title: string;
  year?: number | string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  if (src) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden bg-ink-800", className)}>
        <Image src={src} alt={`${title}${year ? ` (${year})` : ""} artwork`} fill sizes={sizes} loading={priority ? "eager" : undefined} className={cn("object-cover", imgClassName)} />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${title} title card`}
      className={cn("absolute inset-0 flex overflow-hidden bg-ink-800 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(232,181,58,0.22),transparent_60%),radial-gradient(100%_80%_at_100%_100%,rgba(232,115,26,0.18),transparent_55%)]", className)}
    >
      <span className="display pointer-events-none absolute -right-4 -bottom-8 text-[9rem] leading-none text-paper/[0.04] select-none">{initials(title)}</span>
      <div className="absolute inset-3 border border-gold/20" />
      <div className="relative m-auto flex flex-col items-center px-6 text-center">
        <span className="eyebrow text-[max(0.55rem,9px)] text-gold/80">SVC Archive</span>
        <span className="display mt-3 text-2xl text-paper sm:text-3xl">{title}</span>
        {year && <span className="mt-2 text-xs tracking-[0.3em] text-mute">{year}</span>}
      </div>
    </div>
  );
}
