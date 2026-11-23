/**
 * What Dil Raju has started, for the home page's "Beyond the banner" section, and the public
 * offices he has held. Dates follow the site's own timeline (site.ts banners, timeline.ts).
 *
 * Sources: Sri Venkateswara Film Distributors, SVC and Dil Raju Productions as in site.ts;
 * Lorven AI Studio: launch in Hyderabad, May 2025, with Quantum AI Global, inaugurated by Telangana
 * IT Minister D. Sridhar Babu (The Hans India; launch videos on Dil Raju's official channel);
 * Dil Raju Dreams: launched 28 June 2025, first film Markandeya announced 12 February 2026
 * (official channel, dilrajudreams.com); TGFDC chairmanship from 3 December 2024 (Government of
 * Telangana order, reported by Telangana Today and Deccan Chronicle); TFCC presidency from July
 * 2023 (The News Minute) until the December 2025 elections, which chose D. Suresh Babu for 2025-27
 * (Deccan Chronicle, 123telugu).
 *
 * Key figures and highlights: Dil Raju's own words at the Dil Raju Dreams launch (June 2025) and the
 * Lorven AI Studio launch (May 2025), on his official channel (films completed, how scripts are
 * chosen, the new directors Dil Raju Productions introduced, the registrations, Lorven's aims);
 * his statement on theatre ownership (Newsmeter); Toxic's Telugu rights (Deccan Chronicle);
 * debut directors as in the home page's launchpad.
 */

export type VentureLink =
  | { label: string; href: string; external?: boolean }
  | { label: string; video: { id: string; title: string; label: string; start?: number } };

export type Venture = {
  key: string;
  /** Shown large beside the story. */
  year: string;
  /** Shown small above the year, when the month matters (two began in 2025). */
  month?: string;
  name: string;
  kind: string;
  /** One line, in italics, under the name. */
  line: string;
  body: string;
  facts: string[];
  image: { src: string; w: number; h: number; alt: string; position?: string };
  /** The venture's own mark, on a small plate over the picture. */
  logo?: { src: string; w: number; h: number; plate: "light" | "dark" };
  /** A second picture, set into the corner. */
  inset?: { src: string; w: number; h: number; label: string };
  links: VentureLink[];
  credit: string;
  /** A few more things worth knowing. */
  highlights: string[];
};

export const ventures: Venture[] = [
  {
    key: "distribution",
    year: "1999",
    name: "Sri Venkateswara Film Distributors",
    kind: "Distribution",
    line: "Where it all began: releasing films in the Nizam territory.",
    body: "Before he produced a film, Dil Raju distributed them. His first releases included Oke Okkadu, Nuvvu Vasthavani and Sakhi, and distribution has stayed at the heart of the business ever since.",
    facts: ["Nizam territory", "First releases: Oke Okkadu · Nuvvu Vasthavani · Sakhi"],
    image: { src: "/images/journey/oke-okkadu.jpg", w: 1280, h: 594, alt: "A still from Oke Okkadu, one of the first films Dil Raju distributed", position: "50% 40%" },
    links: [{ label: "Distribution", href: "/distribution" }],
    credit: "Still: Oke Okkadu",
    highlights: [
      "Pelli Pandiri, which he distributed in the late '90s after losing ninety lakh rupees in the trade, is the film he credits for the whole journey.",
      "The business still releases other banners' big films in Telugu states, among them Yash's Toxic.",
    ],
  },
  {
    key: "svc",
    year: "2003",
    name: "Sri Venkateswara Creations",
    kind: "Production banner",
    line: "The banner, launched with the film that gave him his name.",
    body: "Dil was its first production. Arya, Bommarillu, Fidaa, Maharshi and Sankranthiki Vasthunam followed, along with National Film Awards for Shatamanam Bhavati and Maharshi.",
    facts: ["First film: Dil (2003)", "Two National Film Awards"],
    image: { src: "/images/journey/dil.jpg", w: 1078, h: 546, alt: "A still from Dil (2003), the first SVC production", position: "50% 35%" },
    links: [{ label: "All SVC films", href: "/films" }],
    credit: "Still: Dil (2003)",
    highlights: [
      "A launchpad for directors: first films for Sukumar (Arya), Boyapati Srinu (Bhadra), Bhaskar (Bommarillu), Vamshi Paidipally (Munna) and Srikanth Addala (Kotha Bangaru Lokam).",
      "Every script is passed by both Dil Raju and Shirish before it goes ahead, and every cut is checked again in the edit.",
      "Next on the slate: Rowdy Janardhana, Yellamma, SVC63 with Salman Khan and SVC64 with Ravi Teja.",
    ],
  },
  {
    key: "dil-raju-productions",
    year: "2023",
    name: "Dil Raju Productions",
    kind: "Sister banner",
    line: "Rooted stories, run by the next generation.",
    body: "Led by Harshith Reddy and Hanshitha Reddy, with Dil Raju as a guide, the banner made its name with Balagam, then Love Me If You Dare and Janaka Aithe Ganaka.",
    facts: ["Harshith Reddy · Hanshitha Reddy", "Balagam (2023)"],
    image: { src: "/images/journey/balagam.jpg", w: 1280, h: 537, alt: "A still from Balagam, produced under Dil Raju Productions", position: "60% 40%" },
    links: [{ label: "Balagam", href: "/films/balagam-2023" }],
    credit: "Still: Balagam",
    highlights: [
      "Begun when SVC, busy with big films after 2014, had less room for newcomers: Harshith and Hanshitha opened a door for them.",
      "Now also planning larger films alongside its content-led ones.",
    ],
  },
  {
    key: "lorven",
    year: "2025",
    month: "May",
    name: "Lorven AI Studio",
    kind: "AI filmmaking studio",
    line: "Lights, camera, intelligence.",
    body: "Built with Quantum AI Global and inaugurated in Hyderabad by Telangana's IT minister, D. Sridhar Babu: AI tools that work alongside filmmakers, from the first draft of a script through pre-production and post-production to promotion.",
    facts: ["Cine Scribe", "Cine Sketch", "Cine Flow", "Pitch Craft"],
    image: { src: "/images/ventures/lorven-launch.jpg", w: 1600, h: 900, alt: "Dil Raju on stage at the launch of Lorven AI Studio in Hyderabad" },
    logo: { src: "/brand/lorven-ai-studio.png", w: 298, h: 62, plate: "light" },
    links: [{ label: "Watch the launch", video: { id: "blWn_FTVuzg", title: "Lorven AI Studio", label: "Dil Raju at the launch" } }],
    credit: "Still: Dil Raju official channel",
    highlights: [
      "Three aims, in Dil Raju's words: raise a film's chance of success, save time, save money.",
      "Works like a first assistant director without emotions: it asks every department the right questions, while the judgment stays with the director.",
      "Already in use on Rowdy Janardhana's script and pre-production, with access for other producers and directors on secure logins.",
    ],
  },
  {
    key: "dreams",
    year: "2025",
    month: "June",
    name: "Dil Raju Dreams",
    kind: "Platform for new talent",
    line: "An open door for new storytellers.",
    body: "Launched in Hyderabad with Vijay Deverakonda and Devi Sri Prasad, it lets newcomers register and pitch their ideas straight to Dil Raju's team. Its first film, Markandeya, starring Vikranth and directed by Sistla VMK, was announced in February 2026.",
    facts: ["First film: Markandeya", "Vikranth · Sistla VMK"],
    image: { src: "/images/ventures/dil-raju-dreams-launch.jpg", w: 1600, h: 900, alt: "Dil Raju speaking at the launch of Dil Raju Dreams", position: "50% 30%" },
    logo: { src: "/brand/dil-raju-dreams.png", w: 298, h: 258, plate: "light" },
    inset: { src: "/images/ventures/markandeya-title.jpg", w: 1400, h: 586, label: "Markandeya · first film" },
    links: [
      { label: "dilrajudreams.com", href: "https://www.dilrajudreams.com/", external: true },
      { label: "Watch the Markandeya glimpse", video: { id: "ryWpShUe1Jc", title: "Markandeya", label: "Title glimpse · Dil Raju Dreams" } },
    ],
    credit: "Stills: Dil Raju official channel",
    highlights: [
      "A dedicated young team, with its own CEO, screens every application; the shortlist reaches Dil Raju's team each week.",
      "Open to writers, directors, actors and technicians, with a separate track for would-be producers to test their plans against the market.",
    ],
  },
];

/** Public offices in the film industry. */
export const offices = [
  {
    title: "Chairman",
    body: "Telangana Film Development Corporation",
    when: "Since December 2024",
    current: true,
    note: "Appointed by the Government of Telangana on 3 December 2024.",
    /** The corporation's emblem (from its stage banner). */
    logo: { src: "/brand/tgfdc-sticker.png", alt: "Telangana State Film Development Corporation" },
  },
  {
    title: "President",
    body: "Telugu Film Chamber of Commerce",
    when: "2023 – 2025",
    current: false,
    note: "Elected in July 2023. The chamber's December 2025 elections chose D. Suresh Babu for 2025–27.",
    /** The chamber's logo (telugufilmchamber.in). */
    logo: { src: "/brand/tfcc-sticker.png", alt: "Telugu Film Chamber of Commerce" },
  },
];
