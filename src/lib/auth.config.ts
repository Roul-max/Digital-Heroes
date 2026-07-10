import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js-only imports (no bcrypt, no Prisma).
// Used by middleware which runs on the Edge Runtime.
// The full config (with Credentials provider + bcrypt) lives in auth.ts.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // Persist role into JWT so middleware can gate routes without a DB hit
      if (user) {
        if (!user.id) return token;
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
};
