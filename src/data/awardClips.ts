/**
 * Footage of awards being presented, for the award cards: short silent loops cut from the
 * ceremonies' own coverage (Doordarshan / Prasar Bharati and the President's Secretariat for the
 * National Film Awards; the award shows' and TV channels' broadcasts for the rest; the studio
 * holds the rights). Each card shows a still until it is on screen.
 */
export type AwardClip = {
  /** The award records (awards.ts) the clip shows being presented. */
  awardIds: string[];
  src: string;
  /** Shown until the clip plays: its best still (the handover itself). */
  poster: string;
  /** object-position in the card's 3:2 frame. */
  focus?: string;
  /** Who presents what to whom, and where. */
  depicts: string;
  creditShort: string;
};

export const awardClips: AwardClip[] = [
  {
    awardIds: ["AW001"],
    src: "/video/awards/card-nfa64.mp4",
    poster: "/video/awards/card-nfa64.jpg",
    depicts: "President Pranab Mukherjee presents the Swarna Kamal to Dil Raju, then to director Satish Vegesna. 64th National Film Awards, New Delhi, 3 May 2017.",
    creditShort: "Doordarshan / Ministry of I&B",
  },
  {
    awardIds: ["AW002", "AW003"],
    src: "/video/awards/card-nfa67.mp4",
    poster: "/video/awards/card-nfa67.jpg",
    depicts: "Vice President M. Venkaiah Naidu presents the Swarna Kamal for Maharshi to Dil Raju, then to director Vamshi Paidipally. 67th National Film Awards, New Delhi, 25 October 2021.",
    creditShort: "Doordarshan National",
  },
  {
    awardIds: ["AW004"],
    src: "/video/awards/card-nfa71.mp4",
    poster: "/video/awards/card-nfa71.jpg",
    depicts: "President Droupadi Murmu presents the Rajat Kamal for Best Lyrics to Kasarla Shyam. 71st National Film Awards, New Delhi, 23 September 2025.",
    creditShort: "President's Secretariat, GoI",
  },
  // ---- From the ceremonies' own coverage ----
  {
    awardIds: ["AW044", "AW045"],
    src: "/video/awards/card-filmfare-2014-svsc-mahesh-babu.mp4",
    poster: "/images/award-cards/filmfare-2014-svsc-mahesh-babu.jpg",
    focus: "50% 20%",
    depicts: "Mahesh Babu on stage holding his Filmfare Best Actor – Telugu trophy for SVSC, 61st Idea Filmfare Awards South, Chennai, 12 Jul 2014",
    creditShort: "MAA TV / YouTube (rock star)",
  },
  {
    awardIds: ["AW054"],
    src: "/video/awards/card-gaddar-2025-shatamanam-bhavati-team.mp4",
    poster: "/images/award-cards/gaddar-2025-shatamanam-bhavati-team.jpg",
    focus: "30% 30%",
    depicts: "CM Revanth Reddy hands the First Best Film (2016) trophy for Shatamanam Bhavati to Sharwanand (black sherwani, holding the trophy) and shakes hands with producer Shirish Reddy (white shirt). Dil Raju (TGFDC chairman, beige vest) is at left. Gaddar Telangana Film Awards, HITEX Hyderabad, 14 Jun 2025",
    creditShort: "NTV Telugu",
  },
  {
    awardIds: ["AW055"],
    src: "/video/awards/card-gaddar-2025-fidaa-shirish-reddy.mp4",
    poster: "/images/award-cards/gaddar-2025-fidaa-shirish-reddy.jpg",
    focus: "30% 30%",
    depicts: "Producer Shirish Reddy receiving the Second Best Film (2017) trophy for Fidaa from CM Revanth Reddy, with Dil Raju (TGFDC chairman) at left. Gaddar Telangana Film Awards, HITEX Hyderabad, 14 Jun 2025",
    creditShort: "NTV Telugu",
  },
  {
    awardIds: ["AW056"],
    src: "/video/awards/card-gaddar-2025-maharshi-team.mp4",
    poster: "/images/award-cards/gaddar-2025-maharshi-team.jpg",
    focus: "15% 30%",
    depicts: "CM Revanth Reddy presents the First Best Film (2019) trophy for Maharshi. The trophy is held by a man in a green shirt, apparently director Vamshi Paidipally, with Pooja Hegde (purple saree) and Dil Raju (left). Gaddar Telangana Film Awards, HITEX Hyderabad, 14 Jun 2025",
    creditShort: "NTV Telugu",
  },
  {
    awardIds: ["AW057"],
    src: "/video/awards/card-gaddar-2025-balagam-team.mp4",
    poster: "/images/award-cards/gaddar-2025-balagam-team.jpg",
    focus: "10% 40%",
    depicts: "Deputy CM Bhatti Vikramarka presents the First Best Film (2023) trophy for Balagam to the film's team, with Dil Raju at far left. Gaddar Telangana Film Awards, HITEX Hyderabad, 14 Jun 2025",
    creditShort: "NTV Telugu",
  },
  {
    awardIds: ["AW058", "AW059"],
    src: "/video/awards/card-gaddar-2026-sankranthiki-vasthunam-shirish-anil-ravipudi.mp4",
    poster: "/images/award-cards/gaddar-2026-sankranthiki-vasthunam-shirish-anil-ravipudi.jpg",
    focus: "60% 35%",
    depicts: "Producer V. Shirish Reddy (Best Wholesome Entertainment Film trophy) and Anil Ravipudi (Best Screenplay trophy) on stage with Deputy CM Bhatti Vikramarka and Nagarjuna. Telangana Gaddar Film Awards 2025 ceremony, Hyderabad, 19 Mar 2026",
    creditShort: "NTV Entertainment",
  },
  {
    awardIds: ["AW064", "AW065"],
    src: "/video/awards/card-siima-2018-fidaa-madhu-priya.mp4",
    poster: "/images/award-cards/siima-2018-fidaa-madhu-priya.jpg",
    focus: "50% 30%",
    depicts: "Madhu Priya speaking with her SIIMA Best Playback Singer (Female) – Telugu trophy for 'Vachinde' (Fidaa), SIIMA 2018, Dubai, Sept 2018",
    creditShort: "SIIMA (YouTube)",
  },
  {
    awardIds: ["AW066"],
    src: "/video/awards/card-siima-2018-mca-bhumika-chawla.mp4",
    poster: "/images/award-cards/siima-2018-mca-bhumika-chawla.jpg",
    focus: "40% 30%",
    depicts: "Bhumika Chawla speaking on stage after receiving her SIIMA award from Shriya Saran (right, holding the trophy), SIIMA 2018, Dubai, Sept 2018",
    creditShort: "SIIMA (YouTube)",
  },
  {
    awardIds: ["AW067", "AW068", "AW069", "AW070", "AW071"],
    src: "/video/awards/card-siima-2021-maharshi-vamshi-paidipally.mp4",
    poster: "/images/award-cards/siima-2021-maharshi-vamshi-paidipally.jpg",
    focus: "45% 25%",
    depicts: "Vamshi Paidipally speaking with his SIIMA Best Director – Telugu trophy for Maharshi, SIIMA 2021, Hyderabad, Sept 2021",
    creditShort: "SIIMA (YouTube)",
  },
  {
    awardIds: ["AW073", "AW074", "AW075", "AW076", "AW077", "AW078"],
    src: "/video/awards/card-siima-2026-sankranthiki-vasthunam-anil-ravipudi.mp4",
    poster: "/images/award-cards/siima-2026-sankranthiki-vasthunam-anil-ravipudi.jpg",
    focus: "60% 30%",
    depicts: "Anil Ravipudi speaking on stage after receiving the SIIMA Best Director – Telugu award for Sankranthiki Vasthunam (trophy at lower right), SIIMA 2026, Bengaluru, 12-13 Sep 2026",
    creditShort: "SIIMA / TFDA (YouTube)",
  },
  {
    awardIds: ["AW086"],
    src: "/video/awards/card-iffi-2025-sankranthiki-vasthunam-team.mp4",
    poster: "/images/award-cards/iffi-2025-sankranthiki-vasthunam-team.jpg",
    focus: "55% 30%",
    depicts: "An IFFI official presents the Indian Panorama 2025 certificate and memento to Dil Raju (check shirt) and Shirish (yellow shirt), with director Anil Ravipudi at right, at the film's screening, 56th IFFI, Goa, Nov 2025",
    creditShort: "Telugu70mm Goa / YouTube",
  },
  {
    awardIds: ["AW084", "AW085"],
    src: "/video/awards/card-inca-2026-sankranthiki-vasthunam-anil-ravipudi.mp4",
    poster: "/images/award-cards/inca-2026-sankranthiki-vasthunam-anil-ravipudi.jpg",
    focus: "50% 25%",
    depicts: "Anil Ravipudi on stage with the INCA Best Director (Telugu) trophy moments after receiving it, INCA Awards 2026",
    creditShort: "TFPC / YouTube",
  },
  {
    awardIds: ["AW083"],
    src: "/video/awards/card-santosham-2019-dil-raju-ramanaidu-award.mp4",
    poster: "/images/award-cards/santosham-2019-dil-raju-ramanaidu-award.jpg",
    focus: "55% 30%",
    depicts: "D. Suresh Babu presents the D. Ramanaidu Memorial Award to Dil Raju on stage at the Santosham South Indian Film Awards 2019 (TV lower-third caption along the bottom)",
    creditShort: "99TV Telugu / YouTube",
  },
  {
    awardIds: ["AW080"],
    src: "/video/awards/card-nagi-reddi-2012-mr-perfect-dil-raju.mp4",
    poster: "/images/award-cards/nagi-reddi-2012-mr-perfect-dil-raju.jpg",
    focus: "45% 25%",
    depicts: "Akkineni Nageswara Rao presents the B. Nagi Reddi Memorial Award memento to Dil Raju, wearing the ceremonial shawl, for Mr. Perfect, Ravindra Bharathi, Hyderabad, 22 Apr 2012",
    creditShort: "TeluguOne / YouTube",
  },
];
