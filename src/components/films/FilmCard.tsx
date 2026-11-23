import Link from "next/link";
import type { Film } from "@/data/types";
import { cn } from "@/lib/utils";
import { FilmPoster } from "./FilmPoster";
import { ArrowIcon } from "@/components/ui/Buttons";

export function RoleBadge({ film, className }: { film: Pick<Film, "category" | "roleLabel">; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.18em] uppercase backdrop-blur-sm",
        film.category === "core" && "border-gold/50 bg-ink/50 text-gold-bright",
        film.category === "presentation" && "border-paper/25 bg-ink/50 text-paper/80",
        film.category === "related" && "border-vermilion/50 bg-ink/50 text-[#ffb3ab]",
        className,
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", film.category === "core" ? "bg-gold" : film.category === "related" ? "bg-vermilion" : "bg-paper/60")} />
      {film.roleLabel}
    </span>
  );
}

export function FilmCard({ film, priority, sizes, className }: { film: Film; priority?: boolean; sizes?: string; className?: string }) {
  return (
    <Link href={`/films/${film.slug}`} className={cn("group block focus-visible:outline-offset-4", className)} aria-label={`${film.title} (${film.year})`}>
      <div className="relative aspect-video overflow-hidden rounded-[2px] ring-1 ring-gold/20 transition duration-700 group-hover:ring-gold/60">
        <FilmPoster
          src={film.image}
          title={film.title}
          year={film.year}
          priority={priority}
          sizes={sizes}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-shade via-shade/20 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-95" />
        <div className="absolute top-3 left-3">
          <RoleBadge film={film} />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between gap-3 p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="line-clamp-2 text-xs leading-relaxed text-ivory/85">{film.premise}</span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink">
            <ArrowIcon />
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="display text-2xl transition-colors duration-500 group-hover:text-gold-bright sm:text-[1.7rem]">{film.title}</h3>
        <span className="shrink-0 tabular-nums tracking-[0.06em] text-xs text-mute">{film.year}</span>
      </div>
      <p className="mt-1 text-[0.8rem] text-mute">
        {film.genre}
        {film.director && <span className="text-dim"> · {film.director}</span>}
      </p>
    </Link>
  );
}
