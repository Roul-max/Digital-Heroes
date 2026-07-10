"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { registerUser } from "@/server/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await registerUser(fd);
    setPending(false);

    if (result.error) {
      const msgs = Object.values(result.error).flat().join(", ");
      toast.error(msgs);
      return;
    }

    toast.success("Account created! Check your email to verify.");
    router.push("/login");
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">Create your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(["name", "email", "password"] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-neutral-700 mb-1.5 capitalize">
              {field}
            </label>
            <input
              id={field}
              name={field}
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required
              className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              disabled={pending}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
