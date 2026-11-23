import type { MetadataRoute } from "next";
import { films } from "@/data";
import { siteUrl } from "@/lib/siteUrl";

const PAGES = ["", "/upcoming", "/films", "/production", "/distribution", "/awards", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...films.map((f) => ({
      url: `${siteUrl}/films/${f.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
