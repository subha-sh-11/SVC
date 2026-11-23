/**
 * Box-office standing, used only to size the films shelf: hits and blockbusters are shown
 * large (2x2, or 2x1 when the poster is landscape). Nothing here is shown as a label.
 * Editorial, from widely reported trade verdicts: SVC should confirm or adjust before launch.
 */
export type Standing = "blockbuster" | "hit";

export const standing: Record<string, Standing> = {
  "dil-2003": "blockbuster",
  "arya-2004": "blockbuster",
  "bommarillu-2006": "blockbuster",
  "seethamma-vakitlo-sirimalle-chettu-2013": "blockbuster",
  "fidaa-2017": "blockbuster",
  "f2-fun-and-frustration-2019": "blockbuster",
  "maharshi-2019": "blockbuster",
  "sarileru-neekevvaru-2020": "blockbuster",
  "sankranthiki-vasthunam-2025": "blockbuster",

  "bhadra-2005": "hit",
  "kotha-bangaru-lokam-2008": "hit",
  "brindavanam-2010": "hit",
  "mr-perfect-2011": "hit",
  "yevadu-2014": "hit",
  "pilla-nuvvu-leni-jeevitham-2014": "hit",
  "supreme-2016": "hit",
  "shatamanam-bhavati-2017": "hit",
  "nenu-local-2017": "hit",
  "dj-duvvada-jagannadham-2017": "hit",
  "raja-the-great-2017": "hit",
  "mca-middle-class-abbayi-2017": "hit",
  "vakeel-saab-2021": "hit",
  "varisu-2023": "hit",
  "balagam-2023": "hit",
};
