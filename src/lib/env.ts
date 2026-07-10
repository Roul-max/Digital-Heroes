import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email().default("noreply@leadrouter.app"),
  SLA_HOURS: z.coerce.number().int().min(1).default(2),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Upstash Redis — optional; falls back to in-memory rate limiting when absent
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Throws at startup if env is misconfigured — never silently undefined
export const env = envSchema.parse(process.env);
