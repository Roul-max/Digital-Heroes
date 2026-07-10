import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LeadRouter — Intelligent Lead Routing CRM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", letterSpacing: "-2px" }}>
          LeadRouter
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginTop: 16,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Automatically route inbound leads to sales reps with configurable rules and SLA tracking.
        </div>
        <div
          style={{
            marginTop: 48,
            padding: "12px 32px",
            background: "#2563eb",
            borderRadius: 12,
            fontSize: 22,
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          Built with Next.js · Prisma · Auth.js
        </div>
      </div>
    ),
    { ...size }
  );
}
