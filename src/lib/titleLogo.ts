/** Title logos lettered in dark inks, which need a lamp-light halo to read on dark grounds. */
const DARK_INK = new Set(["bhadra-2005", "raja-the-great-2017", "seethamma-vakitlo-sirimalle-chettu-2013", "v-2020"]);

/**
 * Title logos lettered mostly in white or very pale inks (measured from the artwork), which need a
 * fine dark edge to read on white grounds.
 */
const LIGHT_INK = new Set([
  "arya-2004",
  "brindavanam-2010",
  "gaganam-2011",
  "game-changer-2025",
  "hello-guru-prema-kosame-2018",
  "kerintha-2015",
  "maharshi-2019",
  "mca-middle-class-abbayi-2017",
  "mr-perfect-2011",
  "munna-2007",
  "nenu-local-2017",
  "parugu-2008",
  "ramayya-vasthavayya-2013",
  "sankranthiki-vasthunam-2025",
  "seethamma-vakitlo-sirimalle-chettu-2013",
  "subramanyam-for-sale-2015",
  "varisu-2023",
]);

/** Shadow (or, for dark logos, a soft warm halo) that lifts a title logo off dark imagery. */
export function logoGlow(slug: string) {
  return DARK_INK.has(slug)
    ? "[filter:drop-shadow(0_0_1px_rgba(255,240,215,0.85))_drop-shadow(0_0_12px_rgba(255,214,150,0.45))]"
    : "[filter:drop-shadow(0_3px_12px_rgba(0,0,0,0.6))]";
}

/** Classes for a logo set straight on a dark ground, shown in its own colours. */
export function reelInk(slug: string) {
  return DARK_INK.has(slug) ? "reel-logo reel-logo--dark-ink" : "reel-logo";
}

/** Classes for a logo set straight on white, in its own colours (pale ones get a fine dark edge). */
export function whiteInk(slug: string) {
  return LIGHT_INK.has(slug) ? "logo-on-white logo-on-white--light" : "logo-on-white";
}
