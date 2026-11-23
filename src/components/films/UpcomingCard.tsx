import type { UpcomingProject } from "@/data/types";
import { cn, formatDate } from "@/lib/utils";
import { FilmPoster } from "./FilmPoster";
import { TrailerButton } from "./TrailerButton";

export function statusLabel(status: string | null) {
  if (!status) return "Announced";
  if (status.startsWith("in production")) return "In production";
  if (status.startsWith("in development")) return "In development";
  if (status.startsWith("on hold")) return "On hold";
  if (status.startsWith("historical")) return "Awaiting confirmation";
  return "Announced";
}

export function releaseLabel(release: string | null) {
  if (!release) return "Release date to be announced";
  if (/^\d{4}-\d{2}-\d{2}$/.test(release)) return `Planned · ${formatDate(release)}`;
  const r = release.replace(/;.*$/, "").trim();
  const m = /^(.*?)\s+(reported|planned|announced window)$/i.exec(r);
  if (m) {
    const kind = m[2].toLowerCase() === "announced window" ? "Announced window" : m[2][0].toUpperCase() + m[2].slice(1).toLowerCase();
    return `${kind} · ${m[1]}`;
  }
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function UpcomingCard({ project, large = false, className }: { project: UpcomingProject; large?: boolean; className?: string }) {
  const status = statusLabel(project.status);
  const quiet = status === "On hold" || status === "Awaiting confirmation";
  const video = project.videos[0];
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className={cn("relative overflow-hidden rounded-[2px] ring-1 ring-gold/20 transition duration-700 group-hover:ring-gold/50", large ? "aspect-[16/9]" : "aspect-video")}>
        <FilmPoster
          src={project.image}
          title={project.title}
          sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-shade/80 via-transparent to-transparent" />
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-2 rounded-[2px] border bg-shade/70 px-3 py-1 text-[max(0.6rem,9px)] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur",
            status === "In production" ? "border-gold/60" : quiet ? "border-ivory/20 text-ivory/70" : "border-vermilion/60",
          )}
        >
          <span className={cn("relative h-1.5 w-1.5 rounded-full", status === "In production" ? "bg-gold" : quiet ? "bg-ivory/50" : "bg-vermilion")}>
            {!quiet && <span className="absolute inset-0 animate-ping rounded-full bg-inherit" />}
          </span>
          {status}
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <p className="text-[max(0.65rem,9px)] font-bold tracking-[0.22em] text-gold uppercase">{releaseLabel(project.release)}</p>
        <h3 className={cn("display mt-2", large ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl")}>{project.title}</h3>
        {project.altNames.length > 0 && <p className="mt-1 text-xs text-dim">Also referenced as {project.altNames.join(", ")}</p>}
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {project.director && (
            <>
              <dt className="text-dim">Director</dt>
              <dd className="text-paper/85">{project.director}</dd>
            </>
          )}
          {project.cast.length > 0 && (
            <>
              <dt className="text-dim">Cast</dt>
              <dd className="text-paper/85">{project.cast.join(", ")}</dd>
            </>
          )}
          {project.banner && (
            <>
              <dt className="text-dim">Banner</dt>
              <dd className="text-paper/85">{project.banner}</dd>
            </>
          )}
        </dl>
        {video && (
          <div className="mt-6">
            <TrailerButton youtubeId={video.youtubeId} title={project.title} label={`Watch ${video.label}`} variant="ghost" />
          </div>
        )}
      </div>
    </article>
  );
}
