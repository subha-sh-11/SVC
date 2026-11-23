// Hand-authored site content drawn from SVC_Research_and_Website_Content.pdf
// ("Original website copy", "Company identity and people", "Related banners").

export const site = {
  name: "Sri Venkateswara Creations",
  short: "SVC",
  base: "Hyderabad, Telangana, India",
  since: 2003,
  distributionSince: 1999,
  title: "Sri Venkateswara Creations | Films and Company History",
  description:
    "Explore Sri Venkateswara Creations films, company history, awards, filmmakers and announced projects, with trailers and stories from the SVC archive.",
};

export const nav = [
  { href: "/upcoming", label: "Upcoming" },
  { href: "/films", label: "Films" },
  { href: "/production", label: "Production" },
  { href: "/distribution", label: "Distribution" },
  { href: "/awards", label: "Awards" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const copy = {
  heroLine:
    "Explore the films, filmmakers and milestones of SVC, from Dil in 2003 to new stories in development.",
  aboutShort:
    "Sri Venkateswara Creations is a Hyderabad-based film production banner associated with producers Dil Raju and Shirish. Its production journey began with Dil in 2003, followed by films spanning romance, family drama, comedy and action.",
  aboutLong:
    "Sri Venkateswara Creations began its production journey with Dil in 2003. Over the years, the banner has worked with established stars and emerging filmmakers on films including Arya, Bommarillu, Seethamma Vakitlo Sirimalle Chettu, Fidaa and Maharshi. Its catalogue extends across intimate family stories, romantic dramas, action films and ensemble comedies. The journey includes national recognition for Shatamanam Bhavati and Maharshi, alongside later projects such as Varisu, Game Changer and Sankranthiki Vasthunam. Explore each film to discover the people, collaborations and creative work behind it.",
  history:
    "SVC's story connects two journeys: the distribution business established in 1999 and the move into original film production with Dil in 2003. The timeline follows the films, creative collaborations and recognitions that shaped the banner.",
  films:
    "Browse the catalogue by year, language and SVC's role in each release. Film pages bring together cast and crew, original story summaries, trailers and artwork.",
  awards:
    "Explore recognition received by SVC films and their creative teams. Each entry identifies the award, year, category and recipient, with festival selections listed separately.",
  upcoming: "Discover announced projects and follow the latest updates from Sri Venkateswara Creations.",
  people: "Meet the producers and collaborators behind the films.",
  media: "Trailers, film artwork and moments from the SVC archive.",
  contact: "For production, distribution and media enquiries, contact the relevant SVC team.",
};

export interface Person {
  name: string;
  role: string;
  bio: string;
  note?: string;
  image?: string;
}

export const people: Person[] = [
  {
    name: "Dil Raju",
    role: "Founder and producer",
    bio: "Dil Raju is a Hyderabad-based film producer and distributor. His production career began with Dil in 2003 — a success that became part of his professional name. His work includes Telugu films across family drama, romance, comedy and action, with later projects in Tamil and Hindi.",
    note: "Telangana's official portal lists him as Chairman of the Telangana Film Development Corporation — an external public role.",
    image: "/images/dilraju_dreams_portrait.jpg",
  },
  {
    name: "Shirish",
    role: "Producer and long-standing collaborator",
    bio: "Shirish, also credited as Sirish, has worked with Dil Raju across SVC's production activities, with producer credits on films from Nenu Local and Fidaa to Game Changer, Sankranthiki Vasthunam and Thammudu.",
  },
  {
    name: "Harshith Reddy",
    role: "Producer, Dil Raju Productions",
    bio: "Harshith Reddy works in the wider Dil Raju production network and is a producer under Dil Raju Productions, with credits that include Balagam, ATM and Janaka Aithe Ganaka, alongside selected SVC projects.",
  },
  {
    name: "Hanshitha Reddy",
    role: "Producer, Dil Raju Productions",
    bio: "Hanshitha Reddy is a producer under Dil Raju Productions. Her filmography includes Balagam and later projects developed under that banner, including Love Me If You Dare and Janaka Aithe Ganaka.",
  },
];

export const historicalCollaborators =
  "Early accounts and Dil's producer credits record the involvement of Lakshman and Giri in the formative distribution and production journey.";

export interface Banner {
  name: string;
  relationship: string;
  description: string;
  href?: string;
}

export const banners: Banner[] = [
  {
    name: "Sri Venkateswara Creations",
    relationship: "Production banner",
    description: "The production banner behind Dil, Arya, Bommarillu, Fidaa, Maharshi, Sankranthiki Vasthunam and more — productions, co-productions and presentations since 2003.",
  },
  {
    name: "Sri Venkateswara Film Distributors",
    relationship: "Distribution roots · 1999",
    description: "The distribution business that began in Nizam in 1999, with Oke Okkadu, Nuvvu Vasthavani and Sakhi among its first releases.",
  },
  {
    name: "Dil Raju Productions",
    relationship: "Related banner",
    description: "A related banner in the Dil Raju production network, led by producers Harshith Reddy and Hanshitha Reddy — home to Balagam, Love Me If You Dare and Janaka Aithe Ganaka.",
  },
  {
    name: "DilRaju Dreams",
    relationship: "Talent platform · 2025",
    description: "A platform launched in Hyderabad in June 2025 to connect emerging film talent with the industry. Markandeya was announced as its first film in February 2026.",
    href: "https://www.dilrajudreams.com/",
  },
  {
    name: "Lorven AI Studio",
    relationship: "Related industry initiative · 2025",
    description: "A filmmaking-technology initiative involving Dil Raju, developed with Quantum AI and launched in Hyderabad in May 2025.",
  },
];

export const socials = [
  { label: "Instagram", handle: "@srivenkateswaracreations", href: "https://instagram.com/srivenkateswaracreations" },
  { label: "X", handle: "@SVC_official", href: "https://twitter.com/SVC_official" },
  { label: "Facebook", handle: "SriVenkateswaraCreations", href: "https://www.facebook.com/SriVenkateswaraCreations/" },
  { label: "YouTube", handle: "@dilraju", href: "https://www.youtube.com/@dilraju" },
  { label: "Telegram", handle: "SVC_Official", href: "https://t.me/SVC_Official" },
] as const;

export const relatedSocials = [
  { label: "Dil Raju Productions — X", href: "https://twitter.com/dilrajuprodctns" },
  { label: "Dil Raju — Facebook", href: "https://facebook.com/DilRajuOfficial" },
  { label: "DilRaju Dreams", href: "https://www.dilrajudreams.com/" },
];

/** Hero rotation on the home page: approved high-resolution SVC artwork. */
export const heroSlugs = [
  "sankranthiki-vasthunam-2025",
  "game-changer-2025",
  "fidaa-2017",
  "maharshi-2019",
  "vakeel-saab-2021",
  "f2-fun-and-frustration-2019",
];

export const signatureSlugs = [
  "dil-2003",
  "arya-2004",
  "bommarillu-2006",
  "kotha-bangaru-lokam-2008",
  "seethamma-vakitlo-sirimalle-chettu-2013",
  "shatamanam-bhavati-2017",
  "fidaa-2017",
  "f2-fun-and-frustration-2019",
  "maharshi-2019",
  "vakeel-saab-2021",
  "varisu-2023",
  "sankranthiki-vasthunam-2025",
];
