"use client";

import Image from "next/image";
import { useTrailer } from "@/components/providers/TrailerProvider";
import { GhostButton, PlayIcon, PrimaryButton } from "@/components/ui/Buttons";
import { cn, youtubeThumb } from "@/lib/utils";

export function TrailerButton({ youtubeId, title, label = "Watch Trailer", variant = "primary" }: { youtubeId: string; title: string; label?: string; variant?: "primary" | "ghost" }) {
  const open = useTrailer();
  const onClick = () => open({ youtubeId, title, label: label.replace(/^Watch /, "") });
  return variant === "primary" ? (
    <PrimaryButton onClick={onClick} icon="play">
      {label}
    </PrimaryButton>
  ) : (
    <GhostButton onClick={onClick} icon="play">
      {label}
    </GhostButton>
  );
}

/** Video tile: local artwork when available, YouTube's thumbnail otherwise. */
export function VideoTile({ youtubeId, title, label, image, className }: { youtubeId: string; title: string; label: string; image?: string | null; className?: string }) {
  const open = useTrailer();
  return (
    <button type="button" onClick={() => open({ youtubeId, title, label })} className={cn("group block w-full text-left", className)}>
      <div className="relative aspect-video overflow-hidden rounded-[2px] ring-1 ring-gold/20 transition group-hover:ring-gold/60">
        <Image
          src={image ?? youtubeThumb(youtubeId)}
          alt={`${title} — ${label}`}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          unoptimized={!image}
          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/40 transition group-hover:bg-ink/20" />
        <span className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-paper/40 bg-ink/40 text-paper backdrop-blur transition duration-500 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
          <PlayIcon className="h-3.5 w-3.5 translate-x-px" />
        </span>
      </div>
      <p className="mt-3 text-[max(0.65rem,9px)] font-bold tracking-[0.22em] text-gold uppercase">{label}</p>
      <p className="mt-1 text-sm text-paper/90">{title}</p>
    </button>
  );
}
