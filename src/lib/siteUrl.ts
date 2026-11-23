/**
 * The site's public address, without a trailing slash. Used for social-share images, the sitemap
 * and robots.txt.
 *
 * 1. NEXT_PUBLIC_SITE_URL, when set (set it to the real domain, e.g. https://www.svccinemas.com).
 * 2. On Vercel, the project's production domain, which Vercel provides automatically.
 * 3. Otherwise the local dev server.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3210";
}

export const siteUrl = resolveSiteUrl();
