"use client";

import { AmbientBackdrop, screenPixels, slowConnection } from "@/components/ui/AmbientBackdrop";

const BASE = "/video/films/svsc";

/** 1080p (720p on phones and slow connections) first; 4K behind it on screens with the pixels. */
function pick() {
  const slow = slowConnection();
  const px = screenPixels();
  return { first: slow || px < 1100 ? `${BASE}-720.mp4` : `${BASE}-1080.mp4`, uhd: !slow && px >= 2600 ? `${BASE}-2160.mp4` : undefined };
}

/**
 * Behind the top of the Films page: moments from Seethamma Vakitlo Sirimalle Chettu (the jasmine
 * by the door, the family courtyard, the paddy fields, Sankranti), in ambient style: playing across
 * the top 70% of the screen, its colours glowing out below it and fading into the white page.
 */
export function FilmsBackdrop() {
  return <AmbientBackdrop pick={pick} poster={`${BASE}-poster.jpg`} focus="50% 40%" />;
}
