/**
 * The clips of Dil Raju speaking that follow the home page's hero, played one after another:
 * each a stretch of a speech on his official YouTube channel, served from the site (public/video)
 * so it plays sharp, in 1080p (720p on phones). `quote` is what he says in it, in English (a close
 * translation of his Telugu, checked against the video's own captions). "Watch full video" opens
 * the whole speech on YouTube, from where the clip begins.
 */
export type Speech = {
  key: string;
  /** The clip as files on the site: 1080p for wide screens, 720p for phones. */
  hd: string;
  sd: string;
  /** Its first frame, shown while it loads. */
  poster: string;
  videoId: string;
  start: number;
  end: number;
  quote: string;
  /** Where and when he said it. */
  context: string;
  /** The video's uploader, for the credit line. */
  uploader: string;
  translated: boolean;
};

const uploader = "Dil Raju (official channel)";

export const speeches: Speech[] = [
  // "Producer Dil Raju Speech At Dil Raju Dreams - Launch Event" (June 2025), 9:59-10:24: three
  // camera angles on him, no cutaways. He has just named Rajinikanth and Chiranjeevi.
  {
    key: "dreams",
    hd: "/video/dil-raju-dreams-1080.mp4",
    sd: "/video/dil-raju-dreams-720.mp4",
    poster: "/images/speech/dil-raju-dreams-poster.jpg",
    videoId: "wlmukyZupk8",
    start: 599,
    end: 624,
    quote:
      "They worked that hard. Cinema means that much hard work. In other jobs it's an eight-hour day: in at nine, home by five. Anil Ravipudi said it just now: not Dil Raju, it should be Running Raju. From the moment I wake at five, all I think about is what to do, and how to make the film in hand a success. Because it's like that, we have lasted here for thirty years.",
    context: "Dil Raju Dreams launch, 2025",
    uploader,
    translated: true,
  },
  // "Successful Producer Dil Raju Speech At LORVEN AI Studio Grand Launch Event" (May 2025),
  // 3:44-4:18: on him, with a moment on a guest listening and a wide shot of the stage.
  {
    key: "lorven",
    hd: "/video/dil-raju-lorven-1080.mp4",
    sd: "/video/dil-raju-lorven-720.mp4",
    poster: "/images/speech/dil-raju-lorven-poster.jpg",
    videoId: "blWn_FTVuzg",
    start: 224,
    end: 258,
    quote:
      "Two years ago, when a discussion about AI began, this idea came. Looking at how Indian film has kept changing for ninety years, and at what we have watched for thirty, we understood that AI is going to be a big change, one that will change the whole world. So for the last two years, we have been working on AI.",
    context: "Lorven AI Studio launch, 2025",
    uploader,
    translated: true,
  },
  // "Producer Dil Raju speech at Dil Raju Dreams - Production No.1 Title Glimpse Launch Event"
  // (12 February 2026), 1:24-1:49: a steady close-up, no cutaways.
  {
    key: "journey",
    hd: "/video/dil-raju-journey-1080.mp4",
    sd: "/video/dil-raju-journey-720.mp4",
    poster: "/images/speech/dil-raju-journey-poster.jpg",
    videoId: "I1TemvRaLC0",
    start: 84,
    end: 109,
    quote:
      "When I came into the industry, I was in the same position. In the '90s I lost ninety lakh rupees in distribution, a huge amount then. Luckily, by God's grace, because I stayed honest, Costume Krishna garu gave me Pelli Pandiri. That film is the reason for this thirty-year journey.",
    context: "Dil Raju Dreams title launch, 2026",
    uploader,
    translated: true,
  },
];
