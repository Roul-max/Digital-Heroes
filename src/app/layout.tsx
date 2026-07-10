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

export const metadata: Metadata = {
  title: {
    default: "LeadRouter — Intelligent Lead Routing CRM",
    template: "%s | LeadRouter",
  },
  description:
    "Automatically route inbound leads to sales reps with configurable rules and SLA tracking.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "LeadRouter",
  },
  twitter: { card: "summary_large_image" },
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
        <Providers>
          {children}
          <Toaster richColors closeButton duration={4000} position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
