import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sqrly.net";
  const now = new Date();

  return [
    { url: base,              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/seo`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/legal`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/auth`,    lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
  ];
}