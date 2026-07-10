import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth providers — only registered when env vars are present
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })]
      : []),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email, deletedAt: null },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified && process.env.NODE_ENV !== "development") return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For OAuth sign-ins, auto-verify email and assign REP role if new user
      if (account?.provider === "google" || account?.provider === "github") {
        if (user.email) {
          await prisma.user.upsert({
            where: { email: user.email },
            update: { emailVerified: new Date() },
            create: {
              email: user.email,
              name: user.name ?? null,
              passwordHash: "", // OAuth users have no password
              role: "REP",
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? "";
        // For OAuth, fetch role from DB since it's not in the provider payload
        if (account?.provider === "google" || account?.provider === "github") {
          const dbUser = await prisma.user.findUnique({ where: { email: token.email! } });
          token.role = dbUser?.role ?? "REP";
          token.id = dbUser?.id ?? token.id ?? "";
        } else {
          token.role = (user as { role: string }).role;
        }
      }
      return token;
    },
  },
});
