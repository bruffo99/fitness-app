import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteConfig.url}/booking`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/my-story`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];
}
