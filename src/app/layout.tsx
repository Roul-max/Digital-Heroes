import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL !== "http://localhost:3000"
    ? process.env.NEXTAUTH_URL
    : "https://leadrouter.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "LeadRouter — Intelligent Lead Routing CRM",
    template: "%s | LeadRouter",
  },
  description:
    "Automatically route inbound leads to sales reps with configurable rules and SLA tracking.",
  metadataBase: new URL(BASE),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "LeadRouter",
    title: "LeadRouter — Intelligent Lead Routing CRM",
    description: "Automatically route inbound leads to sales reps with configurable rules and SLA tracking.",
    url: BASE,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "LeadRouter — Intelligent Lead Routing CRM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadRouter — Intelligent Lead Routing CRM",
    description: "Automatically route inbound leads to sales reps with configurable rules and SLA tracking.",
    images: ["/opengraph-image.png"],
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  keywords: ["lead routing", "CRM", "sales automation", "SLA tracking", "round robin"],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LeadRouter",
  applicationCategory: "BusinessApplication",
  description:
    "Automatically route inbound leads to sales reps with configurable rules and SLA tracking.",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-neutral-50 text-neutral-900 font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster richColors closeButton duration={4000} position="bottom-right" />
          {/* Polite live region so screen readers announce toast messages */}
          <div aria-live="polite" aria-atomic="true" className="sr-only" id="toast-announcer" />
        </Providers>
      </body>
    </html>
  );
}
