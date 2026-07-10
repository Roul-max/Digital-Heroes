import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register", "/verify-email", "/reset-password", "/api/auth"];

export default auth(function middleware(req: NextRequest & { auth: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role;

  // Rep cannot access admin-only routes
  if (role === "REP" && (pathname.startsWith("/admin") || pathname.startsWith("/rules") || pathname.startsWith("/team"))) {
    return NextResponse.redirect(new URL("/rep", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
