import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL !== "http://localhost:3000"
    ? process.env.NEXTAUTH_URL
    : "https://leadrouter.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/reset-password`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
