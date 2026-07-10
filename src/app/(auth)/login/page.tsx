"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { checkLoginRateLimit } from "@/server/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;

    // Server-side rate limit check (IP + email), ~5 attempts / 15 min
    const { allowed, retryAfter } = await checkLoginRateLimit(email);
    if (!allowed) {
      setPending(false);
      const minutes = retryAfter ? Math.ceil(retryAfter / 60) : 15;
      toast.error(`Too many attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password: fd.get("password"),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      toast.error("Invalid credentials or unverified email");
      return;
    }

    // Fetch the session to determine role for redirect
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    router.push(session?.user?.role === "REP" ? "/rep" : "/admin");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:opacity-50"
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:opacity-50"
            disabled={pending}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-neutral-500">
        <Link href="/register" className="hover:text-neutral-900 transition-colors">
          Create account
        </Link>
        <Link href="/reset-password" className="hover:text-neutral-900 transition-colors">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
