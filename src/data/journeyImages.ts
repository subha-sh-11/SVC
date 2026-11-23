/**
 * The picture for each Journey milestone (keyed by its title in timeline.ts), chosen to show
 * that moment: clean film stills (no "TRAILER" or view-count lettering; see
 * scripts/fetch_journey_images.py), ceremony photographs for the national awards, and
 * `null` where nothing real exists yet (shown as a title card).
 */
export type JourneyImage = {
  src: string;
  /** object-position within the frame. */
  focus?: string;
  /** Show whole (a logo), on this background, rather than cropped to fill. */
  contain?: string;
};

export const journeyImages: Record<string, JourneyImage | null> = {
  "An early distribution turning point": { src: "/images/journey/pelli-pandiri-1997.jpg" },
  "Sri Venkateswara Film Distributors": { src: "/images/journey/oke-okkadu-song.jpg", focus: "50% 30%" },
  "Dil begins the production journey": { src: "/images/dil_sunnxt_landscape.jpg" },
  "Arya introduces Sukumar": { src: "/images/journey/arya.jpg", focus: "50% 40%" },
  "Bhadra introduces Boyapati Srinu": { src: "/images/bhadra_prime_video_artwork.jpg" },
  Bommarillu: { src: "/images/journey/bommarillu.jpg" },
  "More directorial debuts": { src: "/images/journey/munna.jpg" },
  "Seethamma Vakitlo Sirimalle Chettu": { src: "/images/seethamma_vakitlo_sirimalle_chettu__8-fsOSq-_Mw.jpg" },
  "A busy year of six core releases": { src: "/images/frames/fidaa-2017.jpg" },
  "National recognition for Shatamanam Bhavati": { src: "/images/shatamanam_national_award_2017_godl.jpg", focus: "70% 40%" },
  "F2 and Maharshi": { src: "/images/frames/f2-fun-and-frustration-2019.jpg" },
  "V premieres digitally": { src: "/images/journey/v.jpg" },
  "National recognition for Maharshi": { src: "/images/awards/nfa67-maharshi-swarna-kamal.jpg", focus: "70% 30%" },
  "Hindi films in the wider production network": { src: "/images/journey/jersey.jpg" },
  "Varisu and two decades of production": { src: "/images/journey/varisu.jpg" },
  "Balagam under Dil Raju Productions": { src: "/images/journey/balagam.jpg" },
  "Game Changer and SVC50": { src: "/images/frames/game-changer-2025.jpg" },
  "Sankranthiki Vasthunam": { src: "/images/frames/sankranthiki-vasthunam-2025.jpg" },
  "Lorven AI Studio launch": { src: "/images/ventures/lorven-launch.jpg", focus: "50% 40%" },
  "Dil Raju Dreams platform launch": { src: "/images/ventures/dil-raju-dreams-launch.jpg", focus: "50% 30%" },
  "Markandeya announced through DilRaju Dreams": { src: "/images/upcoming-posters/markandeya.jpg", focus: "50% 45%" },
  "New Telugu and Hindi announcements": { src: "/images/frames/rowdy-janardhana.jpg" },
};
