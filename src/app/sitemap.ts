import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://leadrouter.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];
}
