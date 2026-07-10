import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Verify your LeadRouter account",
    html: `<p>Click <a href="${url}">here</a> to verify your email. Link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your LeadRouter password",
    html: `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 30 minutes and can only be used once.</p>`,
  });
}
