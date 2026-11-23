/**
 * Real photographs of awards being presented for SVC (and Dil Raju Productions) films, for
 * the awards page and its photo wall. Only freely reusable images: Government of India
 * photographs (PIB / GODL-India) and Creative Commons. Keep each photo's credit with it.
 * SVC's own ceremony photographs (Filmfare, SIIMA, Nandi...) can be added here the same way.
 */
export type AwardPhoto = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Who presents what to whom. */
  caption: string;
  /** Award and category, e.g. "64th National Film Awards · Best Popular Film". */
  award: string;
  /** Filter group on the wall. */
  group: string;
  film?: string;
  filmSlug?: string;
  date: string;
  /** object-position when the photo is shown cropped to a fixed shape. */
  focus?: string;
  /** object-position when cropped to a tall 2:3 poster (centred on the handover). */
  posterFocus?: string;
  /** Move the photo down inside a poster (when faces sit at its very top, under the laurels). */
  posterShift?: string;
  /** The award records (src/data/awards.ts) this photo shows being presented. */
  awardIds?: string[];
  credit: string;
  /** Short credit for small print on a poster. */
  creditShort: string;
  source: string;
};

const PIB = "Press Information Bureau, Government of India";
const GODL = "President's Secretariat / PIB, Government of India (GODL-India), via Wikimedia Commons";
const POPULAR = "Best Popular Film Providing Wholesome Entertainment";

export const awardPhotos: AwardPhoto[] = [
  {
    src: "/images/awards/nfa67-maharshi-swarna-kamal.jpg",
    w: 2135,
    h: 962,
    alt: "Vice President M. Venkaiah Naidu presents the Swarna Kamal to Dil Raju for Maharshi",
    caption: "Vice President M. Venkaiah Naidu presents the Swarna Kamal to Dil Raju, for Sri Venkateswara Creations",
    award: `67th National Film Awards · ${POPULAR}`,
    group: "National Film Awards",
    film: "Maharshi",
    filmSlug: "maharshi-2019",
    date: "25 October 2021, Vigyan Bhawan, New Delhi",
    focus: "68% 40%",
    posterFocus: "80% 40%",
    posterShift: "14%",
    awardIds: ["AW002", "AW003"],
    credit: PIB,
    creditShort: "PIB, Government of India",
    source: "https://archive.pib.gov.in/archive2/photoright.aspx?phid=169530",
  },
  {
    src: "/images/shatamanam_national_award_2017_godl.jpg",
    w: 1862,
    h: 1154,
    alt: "President Pranab Mukherjee presents the Swarna Kamal to Dil Raju for Shatamanam Bhavati",
    caption: "President Pranab Mukherjee presents the Swarna Kamal to Dil Raju, for Sri Venkateswara Creations",
    award: `64th National Film Awards · ${POPULAR}`,
    group: "National Film Awards",
    film: "Shatamanam Bhavati",
    filmSlug: "shatamanam-bhavati-2017",
    date: "3 May 2017, Vigyan Bhawan, New Delhi",
    focus: "60% 40%",
    posterFocus: "84% 40%",
    awardIds: ["AW001"],
    credit: GODL,
    creditShort: "PIB, Government of India (GODL-India)",
    source:
      "https://commons.wikimedia.org/wiki/File:Pranab_Mukherjee_presenting_the_Swarn_Kamal_Award_to_the_Producer_Shri_Venkateshwara_Creations,_Rep_Shri_V.V._Reddy_for_Best_Popular_Film_Providing_Wholesome_Entertainment_Sathamanam_Bhavathi.jpg",
  },
  {
    src: "/images/awards/nfa64-shatamanam-director.jpg",
    w: 1858,
    h: 1195,
    alt: "President Pranab Mukherjee presents the Swarna Kamal to director Satish Vegesna for Shatamanam Bhavati",
    caption: "President Pranab Mukherjee presents the Swarna Kamal to director Satish Vegesna",
    award: `64th National Film Awards · ${POPULAR}`,
    group: "National Film Awards",
    film: "Shatamanam Bhavati",
    filmSlug: "shatamanam-bhavati-2017",
    date: "3 May 2017, Vigyan Bhawan, New Delhi",
    focus: "62% 40%",
    awardIds: ["AW001"],
    credit: GODL,
    creditShort: "PIB, Government of India (GODL-India)",
    source:
      "https://commons.wikimedia.org/wiki/File:Pranab_Mukherjee_presenting_the_Swarn_Kamal_Award_to_the_Director,_Shri_Satish_Vagesna_for_Best_Popular_Film_Providing_Wholesome_Entertainment_Sathamanam_Bhavathi,_at_the_64th_National_Film_Awards_Function,_in_New_Delhi.jpg",
  },
  {
    src: "/images/awards/nfa71-balagam-kasarla-shyam.jpg",
    w: 2200,
    h: 1521,
    alt: "President Droupadi Murmu presents the Rajat Kamal for Best Lyrics to Kasarla Shyam for Balagam",
    caption: "President Droupadi Murmu presents the Rajat Kamal for Best Lyrics to Kasarla Shyam",
    award: "71st National Film Awards · Best Lyrics",
    group: "National Film Awards",
    film: "Balagam",
    filmSlug: "balagam-2023",
    date: "23 September 2025, Vigyan Bhawan, New Delhi",
    focus: "70% 60%",
    posterFocus: "98% 50%",
    awardIds: ["AW004"],
    credit: PIB,
    creditShort: "PIB, Government of India",
    source: "https://www.pib.gov.in/ShowAlbum.aspx?albumid=204191",
  },
  {
    src: "/images/awards/tsfdc-2023-balagam-dil-raju.jpg",
    w: 1500,
    h: 1110,
    alt: "Dil Raju receives a memento from the Telangana State Film Development Corporation for Balagam",
    caption: "The Telangana State Film Development Corporation felicitates Dil Raju and the Balagam team",
    award: "TSFDC felicitation · Balagam",
    group: "Felicitations",
    film: "Balagam",
    filmSlug: "balagam-2023",
    date: "23 April 2023, Hyderabad",
    credit: "Pranayraj1985 / Wikimedia Commons, CC BY-SA 4.0 (cropped)",
    creditShort: "Pranayraj1985, CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Dil_Raju_Felicitation_by_TSFDC.jpg",
  },
];
