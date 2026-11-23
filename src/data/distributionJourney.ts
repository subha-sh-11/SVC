// The distribution journey, era by era: hand-written from distribution.ts (the release index),
// speech.ts (Dil Raju on Pelli Pandiri) and ventures.ts. Counts are worked out from the index.
import type { Milestone } from "./types";
import { distribution } from "./distribution";
import { releasePoster } from "./releasePoster";

/** The posters of these films, by their titles in the index (Pelli Pandiri predates it). */
function posters(...titles: string[]) {
  return titles.flatMap((title) => {
    const p = releasePoster(distribution.find((d) => d.film === title) ?? { film: title, filmSlug: null });
    return p ? [{ ...p, title }] : [];
  });
}

/** "11 releases" for the years from..to, as recorded in the index. */
function releases(from: number, to = from) {
  const n = distribution.filter((d) => d.year >= from && d.year <= to).length;
  return `${n} ${n === 1 ? "release" : "releases"}`;
}

export const distributionJourney: Milestone[] = [
  {
    date: "1997",
    title: "Pelli Pandiri",
    type: "The turning point",
    description:
      "After losing ninety lakh rupees in distribution in the '90s, Dil Raju was given Pelli Pandiri by Costume Krishna. He calls it the reason for his thirty-year journey.",
    image: "/images/journey/pelli-pandiri-1997.jpg",
    posters: posters("Pelli Pandiri"),
  },
  {
    date: "1999",
    title: "Sri Venkateswara Film Distributors",
    type: "Nizam",
    description: "The distribution business opens in the Nizam territory. Dil Raju names Oke Okkadu, Nuvvu Vasthavani and Sakhi among its first releases.",
  },
  {
    date: "2000 to 2002",
    title: "Film after film in Nizam",
    type: "Nizam",
    description:
      "Nuvvu Vasthavani and Sakhi, then Kushi, Murari and Nuvvu Naaku Nachav, then Aadi and Amrutha: every release of these years went out in the Nizam territory.",
    posters: posters("Nuvvu Naaku Nachav", "Murari", "Kushi", "Aadi", "Nuvvu Vastavani"),
    badge: releases(2000, 2002),
  },
  {
    date: "2003 to 2006",
    title: "Its own films, and others' hits",
    type: "Nizam",
    description:
      "From Dil in 2003 the business released the banner's own productions, Arya, Bhadra and Bommarillu among them, alongside other banners' films in Nizam such as Athadu, Chatrapati and Pokiri.",
    posters: posters("Arya", "Athadu", "Pokiri", "Chatrapati", "Bommarillu"),
    badge: releases(2003, 2006),
  },
  {
    date: "2007 to 2011",
    title: "New territories",
    type: "Vizag · Andhra Pradesh · Guntur · Tamil Nadu",
    description:
      "Releases reached beyond Nizam: Happy Days in Andhra Pradesh, Vinayakudu and Yuvatha in Nizam and Vizag, Mr. Perfect in Guntur and 100% Love in Tamil Nadu. Nizam had Darling, Golimaar and Vedam.",
    posters: posters("Vinayakudu", "Happy Days", "Darling", "100% Love", "Yuvatha"),
    badge: releases(2007, 2011),
  },
  {
    date: "2012",
    title: "The busiest year",
    type: "Nizam",
    description: "Eleven releases in a single year, the most on record: Gabbar Singh, Rebel, Rachaa, Cameraman Gangatho Rambabu and Damarukam among them.",
    posters: posters("Rebel", "Rachaa", "Gabbar Singh", "Damarukam", "Cameraman Gangatho Rambabu"),
    badge: releases(2012),
  },
  {
    date: "2013 to 2015",
    title: "Mirchi to Baahubali",
    type: "Nizam · Andhra Pradesh and Telangana",
    description:
      "Mirchi, Naayak and Baadshah in Nizam in 2013. By 2015, with Telangana a state of its own, releases such as Pataas went out across both Telugu states, the year of Baahubali: The Beginning.",
    posters: posters("Naayak", "Mirchi", "Baahubali: The Beginning", "Baadshah", "Pataas"),
    badge: releases(2013, 2015),
  },
  {
    date: "2016 to 2018",
    title: "Tamil hits, in Telugu",
    type: "Andhra Pradesh and Telangana",
    description:
      "After OK Bangaram in 2015, Police, Remo and Cheliyaa brought Tamil films by Atlee, Bakkiyaraj Kannan and Mani Ratnam to Telugu audiences. Bharat Ane Nenu followed in Nizam in 2018.",
    posters: posters("OK Bangaram", "Police", "Cheliyaa", "Remo", "Bharat Ane Nenu"),
    badge: releases(2016, 2018),
  },
  {
    date: "2020 to 2022",
    title: "Pan-India, in the Telugu states",
    type: "Andhra Pradesh and Telangana",
    description: "Athade Srimannarayana and Akhanda, then in 2022 K.G.F: Chapter 2, Beast, Ponniyin Selvan: I and Masooda across Andhra Pradesh and Telangana.",
    posters: posters("Akhanda", "Beast", "K.G.F: Chapter 2", "Ponniyin Selvan: I", "Masooda"),
    badge: releases(2020, 2022),
  },
  {
    date: "2023",
    title: "Jawan, Animal, Dasara",
    type: "Andhra Pradesh and Telangana",
    description: "Jawan, Animal, Dasara and Ponniyin Selvan: II across both Telugu states, along with Dunki in Nizam, Music School and the banner's own Vaarasudu.",
    posters: posters("Dasara", "Animal", "Jawan", "Dunki", "Ponniyin Selvan: II"),
    badge: releases(2023),
  },
  {
    date: "2024 to 2025",
    title: "Premalu to OG",
    type: "Andhra Pradesh and Telangana",
    description: "Premalu and Saripodhaa Sanivaaram in 2024, then L2: Empuraan, Pelli Kani Prasad and They Call Him OG in 2025.",
    posters: posters("Premalu", "Saripodhaa Sanivaaram", "They Call Him OG", "L2: Empuraan", "Pelli Kani Prasad"),
    badge: releases(2024, 2025),
  },
  {
    date: "2026",
    title: "Next on Telugu screens",
    type: "Andhra Pradesh · Telangana · Karnataka",
    description: "Rights reported for Ramayana: Part 1 and Yash's Toxic, and an announced release of Vrushakarma across Andhra Pradesh, Telangana and Karnataka.",
    posters: posters("Ramayana: Part 1", "Toxic", "Vrushakarma"),
    badge: releases(2026).replace("releases", "on the way").replace("release", "on the way"),
  },
];
