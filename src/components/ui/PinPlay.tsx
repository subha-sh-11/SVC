"use client";

import { useTrailer } from "@/components/providers/TrailerProvider";
import { PlayIcon } from "@/components/ui/Buttons";

/** A round play button on a pin: opens the film's video. */
export function PinPlay({ youtubeId, title, label }: { youtubeId: string; title: string; label: string }) {
  const open = useTrailer();
  return (
    <button
      type="button"
      onClick={() => open({ youtubeId, title, label })}
      aria-label={`${title}: ${label}`}
      className="absolute right-2.5 bottom-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#2a1408] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] backdrop-blur-sm"
    >
      <PlayIcon className="h-3 w-3 translate-x-px" />
    </button>
  );
}
