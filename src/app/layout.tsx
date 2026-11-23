import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/siteUrl";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { IntroProvider } from "@/components/providers/IntroProvider";
import { TrailerProvider } from "@/components/providers/TrailerProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteTheme } from "@/components/layout/RouteTheme";
import { ScrollProgressBar } from "@/components/ui/motion";

// The fonts ship with the site (src/app/fonts, Latin subsets from Google Fonts) rather than
// being fetched at build time, so they never fall back when Google Fonts can't be reached.

// Royal, high-contrast serif for titles.
const display = localFont({
  src: [
    { path: "./fonts/playfair-normal-400-600.woff2", weight: "400 600", style: "normal" },
    { path: "./fonts/playfair-italic-400-600.woff2", weight: "400 600", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Times New Roman", "serif"],
});

// Geometric sans that echoes the Futura-style SVC wordmark.
const sans = localFont({
  src: [{ path: "./fonts/jost-normal-300-700.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-jost",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Film-title face (award posters, the coming-soon titles and the opening flicker). Not used for SVC's own name.
const titles = localFont({
  src: [{ path: "./fonts/anton-normal-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-anton",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

// Screenplay typewriter face and handwriting (the shooting script and Dil Raju's signature; not preloaded).
const script = localFont({
  src: [
    { path: "./fonts/courier-normal-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/courier-normal-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-courier",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "monospace"],
});
const hand = localFont({
  src: [{ path: "./fonts/caveat-normal-500-600.woff2", weight: "500 600", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
  fallback: ["Segoe Print", "cursive"],
});

export const metadata: Metadata = {
  // Absolute base for social images: NEXT_PUBLIC_SITE_URL, else the Vercel production domain.
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: "%s | Sri Venkateswara Creations",
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    images: [{ url: "/images/sankranthiki_vasthunam__yCkl2Z3PBs0.jpg", width: 1280, height: 720 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#c2520e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable} ${hand.variable} ${titles.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[200] rounded bg-gold px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
          Skip to content
        </a>
        <div className="lattice" aria-hidden="true" />
        <MotionConfig reducedMotion="user">
          <SmoothScroll>
            <IntroProvider>
              <TrailerProvider>
                <ScrollProgressBar />
                <Header />
                <main id="main">
                  <PageTransition>{children}</PageTransition>
                </main>
                <RouteTheme>
                  <Footer />
                </RouteTheme>
              </TrailerProvider>
            </IntroProvider>
          </SmoothScroll>
        </MotionConfig>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
