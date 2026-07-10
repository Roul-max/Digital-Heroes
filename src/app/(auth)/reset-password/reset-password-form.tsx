"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { requestPasswordReset, confirmPasswordReset } from "@/server/actions/auth";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    // IP not available client-side — server reads x-forwarded-for header
    await requestPasswordReset(fd.get("email") as string, "");
    setPending(false);
    setDone(true);
    toast.success("If that email exists, a reset link has been sent.");
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await confirmPasswordReset(token!, fd.get("password") as string);
    setPending(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Password reset! You can now sign in.");
    setDone(true);
  }

  if (done && !token) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
        <p className="text-neutral-700">Check your inbox for a reset link.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">
        {token ? "Set new password" : "Reset your password"}
      </h2>
      <form onSubmit={token ? handleConfirm : handleRequest} className="space-y-4">
        {token ? (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              disabled={pending}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              disabled={pending}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {pending ? "Please wait…" : token ? "Reset password" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
