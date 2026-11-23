import type { Film } from "./types";

/** Where a title streams in India, with the platform's own page for it. */
export interface OttEntry {
  platform: OttPlatform;
  /** The title's page on the platform; null when only the platform is confirmed. */
  url: string | null;
  /** The page that shows the title on the platform (JustWatch, the platform, or a news report). */
  source: string;
}

export type OttPlatform = "Prime Video" | "Netflix" | "JioHotstar" | "ZEE5" | "aha" | "Sun NXT" | "SonyLIV" | "ETV Win" | "YouTube";

/**
 * Verified streaming homes in India (checked November 2026; research notes, sources and
 * confidence in scripts/ott_research.json). Streaming rights change: re-check before launch.
 * Titles not listed here link to JustWatch India instead of a guess.
 */
export const ott: Record<string, OttEntry> = {
  "dil-2003": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/10147/dil-(telugu)/",
    "source": "https://www.justwatch.com/in/movie/dil-2003"
  },
  "arya-2004": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/9915/aarya-(telugu)/",
    "source": "https://www.justwatch.com/in/movie/aarya"
  },
  "bhadra-2005": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.f0b733ac-4a99-614d-4521-bda4175218ab",
    "source": "https://www.justwatch.com/in/movie/bhadra"
  },
  "bommarillu-2006": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=pmJYVUOcou4",
    "source": "https://www.youtube.com/watch?v=pmJYVUOcou4"
  },
  "munna-2007": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=ocZS1KslT48",
    "source": "https://www.youtube.com/watch?v=ocZS1KslT48"
  },
  "parugu-2008": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=VjgYjU8zc24",
    "source": "https://www.youtube.com/watch?v=VjgYjU8zc24"
  },
  "kotha-bangaru-lokam-2008": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.b2b4079f-1105-5407-d90d-998c9b501c57",
    "source": "https://www.justwatch.com/in/movie/kotha-bangaru-lokam"
  },
  "aakasamantha-2009": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.feb9cde9-87e9-cab8-1a14-3f87f3d0edda",
    "source": "https://www.justwatch.com/in/movie/akasamantha"
  },
  "josh-2009": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.a8b53d1b-6888-994c-14e4-2f3fb40f9ea4",
    "source": "https://www.justwatch.com/in/movie/josh"
  },
  "maro-charitra-2010": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/9079/maro-charitra-(2010)/",
    "source": "https://www.justwatch.com/in/movie/marocharitra"
  },
  "rama-rama-krishna-krishna-2010": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/9081/rama-rama-krishna-krishna/",
    "source": "https://www.justwatch.com/in/movie/rama-rama-krishna-krishna"
  },
  "brindavanam-2010": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/11310/brundavanam/",
    "source": "https://www.justwatch.com/in/movie/brindaavanam"
  },
  "gaganam-2011": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/7087/gaganam/",
    "source": "https://www.justwatch.com/in/movie/gaganam"
  },
  "mr-perfect-2011": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/7089/mr.perfect/",
    "source": "https://www.justwatch.com/in/movie/mr-perfect"
  },
  "vaishali-2011": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/7311/vaishali/",
    "source": "https://www.justwatch.com/in/movie/vaishali"
  },
  "oh-my-friend-2011": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/oh-my-friend/0-0-2338",
    "source": "https://www.justwatch.com/in/movie/oh-my-friend"
  },
  "tuneega-tuneega-2012": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=8VFd5DyhJbQ",
    "source": "https://www.youtube.com/watch?v=8VFd5DyhJbQ"
  },
  "seethamma-vakitlo-sirimalle-chettu-2013": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.a2b62373-fe71-0394-e3aa-1be6c0e287df",
    "source": "https://www.justwatch.com/in/movie/seethamma-vakitlo-sirimalle-chettu"
  },
  "ramayya-vasthavayya-2013": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.5eb65ff3-ecd4-8cc5-559d-ac21d49ce0e0",
    "source": "https://www.justwatch.com/in/movie/ramayya-vasthavayya"
  },
  "yevadu-2014": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.3cb3e8d4-7082-f2b6-52f0-65f2d0f18f5b",
    "source": "https://www.justwatch.com/in/movie/yevadu"
  },
  "pilla-nuvvu-leni-jeevitham-2014": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=ID9umX7c1os",
    "source": "https://www.youtube.com/watch?v=ID9umX7c1os"
  },
  "ok-bangaram-2015": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/ok-bangaram/0-0-movie_829419480",
    "source": "https://www.justwatch.com/in/movie/ok-bangaram"
  },
  "kerintha-2015": {
    "platform": "JioHotstar",
    "url": "https://www.hotstar.com/in/movies/kerintha/1000074496",
    "source": "https://www.justwatch.com/in/movie/kerintha"
  },
  "subramanyam-for-sale-2015": {
    "platform": "JioHotstar",
    "url": "https://www.hotstar.com/in/movies/subramanyam-for-sale/1000086489",
    "source": "https://www.justwatch.com/in/movie/subramanyam-for-sale"
  },
  "krishnashtami-2016": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=PTAi6CfXjZM",
    "source": "https://www.youtube.com/watch?v=PTAi6CfXjZM"
  },
  "police-2016": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.beb6e42f-bb64-bae6-c2fd-0b9a2fc6be4a",
    "source": "https://www.justwatch.com/in/movie/theri"
  },
  "supreme-2016": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/supreme/0-0-2707",
    "source": "https://www.justwatch.com/in/movie/supreme"
  },
  "naanna-nenu-naa-boyfriends-2016": {
    "platform": "YouTube",
    "url": "https://www.youtube.com/watch?v=l0-IJw67m_o",
    "source": "https://www.youtube.com/watch?v=l0-IJw67m_o"
  },
  "shatamanam-bhavati-2017": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/sathamanam-bhavathi/0-0-2712",
    "source": "https://www.justwatch.com/in/movie/shatamanam-bhavati"
  },
  "nenu-local-2017": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/nenu-local/0-0-2713",
    "source": "https://www.justwatch.com/in/movie/nenu-local"
  },
  "dj-duvvada-jagannadham-2017": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/dj-duvvada-jagannadham/0-0-2714",
    "source": "https://www.justwatch.com/in/movie/duvvada-jagannadham"
  },
  "fidaa-2017": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.e50843da-8c31-432d-9ffa-de20565080ae",
    "source": "https://www.justwatch.com/in/movie/fidaa"
  },
  "vellipomakey-2017": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.08b3e44c-acc6-b264-8b79-1f60ebb9a64c",
    "source": "https://www.justwatch.com/in/movie/vellipomakey"
  },
  "raja-the-great-2017": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.b2293035-f130-417e-bd52-674e6aaa8448",
    "source": "https://www.justwatch.com/in/movie/raja-the-great"
  },
  "jawaan-2017": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.0ab03d3e-549b-41ac-e940-1c1c22046517",
    "source": "https://www.justwatch.com/in/movie/jawaan"
  },
  "mca-middle-class-abbayi-2017": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.ccb07389-d04c-4439-94ce-8718a15f119c",
    "source": "https://www.justwatch.com/in/movie/m-c-a"
  },
  "lover-2018": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.3eb89cc8-3e78-9a31-19ff-f7f1f6dc9166",
    "source": "https://www.justwatch.com/in/movie/lover-2018"
  },
  "srinivasa-kalyanam-2018": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.6ffc746e-297c-4eb4-ade7-e4e1c38ccd8d",
    "source": "https://www.justwatch.com/in/movie/srinivasa-kalyanam-2018"
  },
  "hello-guru-prema-kosame-2018": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.3eb38905-731f-01fd-3328-a5fa1057448d",
    "source": "https://www.justwatch.com/in/movie/hello-guru-prema-kosame"
  },
  "f2-fun-and-frustration-2019": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.0cb64af3-c554-b3e0-efaf-34db64d6af9f",
    "source": "https://www.justwatch.com/in/movie/f2-fun-and-frustration"
  },
  "maharshi-2019": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.8eb57c89-6b6c-80d7-7dc0-d52c501d0639",
    "source": "https://www.justwatch.com/in/movie/maharshi"
  },
  "aaviri-2019": {
    "platform": "Netflix",
    "url": "https://www.netflix.com/title/81177444",
    "source": "https://www.justwatch.com/in/movie/aaviri"
  },
  "iddari-lokam-okate-2019": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.82b7b582-2941-3d1a-e227-2d4a130cda59",
    "source": "https://www.justwatch.com/in/movie/iddari-lokam-okate"
  },
  "sarileru-neekevvaru-2020": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.b4b83eea-0c0f-5bc4-70cf-1b5bf5d01588",
    "source": "https://www.justwatch.com/in/movie/sarileru-neekevvaru"
  },
  "jaanu-2020": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.9657671c-f5eb-4c5a-8d05-16493e8dc80d",
    "source": "https://www.justwatch.com/in/movie/jaanu"
  },
  "v-2020": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail/V-Telugu/0N4R1TWYS68XQP98W1H49D1NY2",
    "source": "https://www.justwatch.com/in/movie/v"
  },
  "shaadi-mubarak-2021": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.d0bc21fb-a414-cd46-b1b6-146800db00ef",
    "source": "https://www.justwatch.com/in/movie/shaadi-mubarak"
  },
  "vakeel-saab-2021": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.4b1de078-d1e8-406b-a096-d796a9612297",
    "source": "https://www.justwatch.com/in/movie/vakeel-saab"
  },
  "paagal-2021": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.e3890844-52fe-4f36-ae54-a1dd2bea66bf",
    "source": "https://www.justwatch.com/in/movie/paagal"
  },
  "nootokka-jillala-andagadu-2021": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.45273d10-2dae-45d0-9dd9-1f3fd33bba20",
    "source": "https://www.justwatch.com/in/movie/nootokka-zillala-andagaadu"
  },
  "rowdy-boys-2022": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/rowdy-boys/0-0-1z5106110",
    "source": "https://www.justwatch.com/in/movie/rowdy-boys"
  },
  "good-luck-sakhi-2022": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.ccc4a3ff-a6d4-4b89-a3ab-a32eb0336439",
    "source": "https://www.justwatch.com/in/movie/good-luck-sakhi"
  },
  "jersey-hindi-2022": {
    "platform": "Netflix",
    "url": "https://www.netflix.com/title/81350340",
    "source": "https://www.justwatch.com/in/movie/jersey-2022"
  },
  "f3-fun-and-frustration-2022": {
    "platform": "Netflix",
    "url": "https://www.netflix.com/title/81177374",
    "source": "https://www.justwatch.com/in/movie/f3-fun-and-frustration"
  },
  "hit-the-first-case-hindi-2022": {
    "platform": "Netflix",
    "url": "https://www.netflix.com/title/81436989",
    "source": "https://www.justwatch.com/in/movie/hit-the-first-case"
  },
  "thank-you-2022": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.23b96efc-bdb4-4ec3-9925-d6d58c91b96a",
    "source": "https://www.justwatch.com/in/movie/thank-you-2022"
  },
  "ori-devuda-2022": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.d048579d-e19d-4ecf-b3e5-c1abb92ab967",
    "source": "https://www.justwatch.com/in/movie/ori-devuda"
  },
  "varisu-2023": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail/0R1YWU12P55RPK4O7W7JFJXTEM",
    "source": "https://www.justwatch.com/in/movie/varisu"
  },
  "atm-2023": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/web-series/details/atm/0-6-4z5281641",
    "source": "https://www.zee5.com/global/web-series/details/atm/0-6-4z5281641"
  },
  "balagam-2023": {
    "platform": "Sun NXT",
    "url": "https://www.sunnxt.com/movie/detail/201572/balagam/",
    "source": "https://www.justwatch.com/in/movie/balagam"
  },
  "shaakuntalam-2023": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.4ff4c898-ce39-40a9-ac08-6112d38b3193",
    "source": "https://www.justwatch.com/in/movie/shaakuntalam"
  },
  "the-family-star-2024": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail/The-Family-Star/0G3GM6SCC2AP6VFDQ6ZNBHPDON",
    "source": "https://www.justwatch.com/in/movie/family-star"
  },
  "love-me-if-you-dare-2024": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.7d93050f-9007-48f2-972a-616ed20bd4d0",
    "source": "https://www.justwatch.com/in/movie/love-me-if-you-dare-2024"
  },
  "janaka-aithe-ganaka-2024": {
    "platform": "aha",
    "url": "https://www.aha.video/movie/janaka-ayithe-ganaka",
    "source": "https://www.justwatch.com/in/movie/janaka-aithe-ganaka"
  },
  "game-changer-2025": {
    "platform": "Prime Video",
    "url": "https://www.primevideo.com/detail?gti=amzn1.dv.gti.b86b398d-4c64-4a18-ab25-8649095a6bc5",
    "source": "https://www.justwatch.com/in/movie/game-changer-2023"
  },
  "sankranthiki-vasthunam-2025": {
    "platform": "ZEE5",
    "url": "https://www.zee5.com/movies/details/sankranthiki-vasthunam/0-0-1z5710014",
    "source": "https://www.justwatch.com/in/movie/sankranthiki-vasthunam"
  },
  "thammudu-2025": {
    "platform": "Netflix",
    "url": "https://www.netflix.com/title/83072495",
    "source": "https://www.justwatch.com/in/movie/thammudu-2025"
  }
};

/** Each platform's own search, for titles whose platform is confirmed but whose page link is not. */
const SEARCH: Record<OttPlatform, (q: string) => string> = {
  "Prime Video": (q) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${q}`,
  Netflix: (q) => `https://www.netflix.com/search?q=${q}`,
  JioHotstar: (q) => `https://www.hotstar.com/in/explore?search_query=${q}`,
  ZEE5: (q) => `https://www.zee5.com/search?q=${q}`,
  aha: (q) => `https://www.aha.video/search?q=${q}`,
  "Sun NXT": (q) => `https://www.sunnxt.com/search?q=${q}`,
  SonyLIV: (q) => `https://www.sonyliv.com/search?searchTerm=${q}`,
  "ETV Win": (q) => `https://www.etvwin.com/search?q=${q}`,
  YouTube: (q) => `https://www.youtube.com/results?search_query=${q}+full+movie`,
};

export interface WatchLink {
  href: string;
  /** e.g. "Play on Prime Video", or "Where to watch" when the platform is not confirmed. */
  label: string;
  platform: OttPlatform | null;
}

/** The Play button's destination for a film. */
export function watchLink(film: Pick<Film, "slug" | "title" | "year">): WatchLink {
  const entry = ott[film.slug];
  const q = encodeURIComponent(film.title);
  if (entry) {
    return { href: entry.url ?? SEARCH[entry.platform](q), label: `Play on ${entry.platform}`, platform: entry.platform };
  }
  return { href: `https://www.justwatch.com/in/search?q=${encodeURIComponent(`${film.title} ${film.year}`)}`, label: "Where to watch", platform: null };
}
