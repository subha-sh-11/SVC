import { people } from "./site";

/**
 * The people behind the banner, for the home page's "pillars of SVC" and their profiles.
 * Roles and bios follow `people` in site.ts; `match` finds their films by producer credit.
 * Photos: Harshith Reddy (CC BY-SA) from Wikimedia Commons; Dil Raju (Ramayana Telugu
 * pre-release event, 2026, background softened), Shirish and Hanshitha Reddy are stills from
 * their own speeches on Dil Raju's official YouTube channel.
 * (Lakshman and Giri, of the formative years, are left out until a verified photo is supplied.)
 */
export type TeamMember = {
  name: string;
  role: string;
  /** One line under their card. */
  line: string;
  /** The fuller story, in their profile. */
  bio: string;
  note?: string;
  image: string;
  credit: string;
  /** Names they are credited under as producer. */
  match: string[];
  /** Films credited under another form of their name (Dil, 2003, credits "Raju"). */
  alsoSlugs?: string[];
};

const bio = (name: string) => people.find((p) => p.name === name);

export const team: TeamMember[] = [
  {
    name: "Dil Raju",
    role: "Founder & producer",
    line: "A distributor from 1999 and a producer since Dil in 2003, the success that gave him his name.",
    bio: bio("Dil Raju")?.bio ?? "",
    note: bio("Dil Raju")?.note,
    image: "/images/people/dil-raju-stage.jpg",
    credit: "Still: Dil Raju official channel",
    match: ["Dil Raju"],
    alsoSlugs: ["dil-2003"],
  },
  {
    name: "Shirish",
    role: "Producer",
    line: "Producer credits from Nenu Local and Fidaa to Game Changer and Sankranthiki Vasthunam.",
    bio: bio("Shirish")?.bio ?? "",
    image: "/images/people/shirish.jpg",
    credit: "Still: Dil Raju official channel",
    match: ["Shirish", "Sirish"],
  },
  {
    name: "Harshith Reddy",
    role: "Producer, Dil Raju Productions",
    line: "Balagam, ATM and Janaka Aithe Ganaka, alongside selected SVC projects.",
    bio: bio("Harshith Reddy")?.bio ?? "",
    image: "/images/people/harshith-reddy.jpg",
    credit: "Photo: Pranayraj1985, CC BY-SA 4.0",
    match: ["Harshith"],
  },
  {
    name: "Hanshitha Reddy",
    role: "Producer, Dil Raju Productions",
    line: "Balagam, Love Me If You Dare and Janaka Aithe Ganaka.",
    bio: bio("Hanshitha Reddy")?.bio ?? "",
    image: "/images/people/hanshitha-reddy.jpg",
    credit: "Still: Dil Raju official channel",
    match: ["Hanshitha"],
  },
];
