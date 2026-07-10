"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function checkLoginRateLimit(email: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  return checkRateLimit(`login:${ip}:${email}`);
}

export async function registerUser(formData: FormData) {
  const parsed = RegisterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: { email: ["Email already registered"] } };

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyTokenHash = crypto.createHash("sha256").update(verifyToken).digest("hex");

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "REP",
      verificationToken: verifyTokenHash,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(email, verifyToken);
  return { success: true };
}

export async function verifyEmail(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: tokenHash,
      verificationTokenExpiry: { gt: new Date() },
      emailVerified: null,
    },
  });

  if (!user) return { error: "Invalid or expired verification link" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return { success: true };
}

export async function requestPasswordReset(email: string, ip: string) {
  const rateLimitKey = `reset:${ip}:${email}`;
  const { allowed, retryAfter } = await checkRateLimit(rateLimitKey);
  if (!allowed) return { error: `Too many attempts. Retry in ${retryAfter}s` };

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user) return { success: true };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 min TTL
    },
  });

  await sendPasswordResetEmail(email, token);
  return { success: true };
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) return { error: "Invalid or expired reset link" };

  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Invalidate token immediately after use — single-use guarantee
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return { success: true };
}
