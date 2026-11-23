import path from "node:path";
import type { NextConfig } from "next";

// Videos, posters and photos rarely change: let browsers keep them for a week and the CDN serve a
// stale copy for a month while it refetches. (File names aren't hashed, so not "immutable".)
const MEDIA_CACHE = "public, max-age=604800, stale-while-revalidate=2592000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // This folder is the project root, even if a package.json exists in a parent folder
  // (otherwise Next.js guesses the parent and Turbopack's CSS step fails).
  turbopack: { root: path.resolve(__dirname) },
  outputFileTracingRoot: path.resolve(__dirname),
  // Let the dev server be previewed through an ngrok tunnel (dev only; ignored by `next start`).
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
  // The single Journey page became two: production and distribution.
  async redirects() {
    return [{ source: "/journey", destination: "/production", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      ...["/video/:path*", "/posters/:path*", "/images/:path*", "/brand/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: MEDIA_CACHE }],
      })),
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
  },
};

export default nextConfig;
