import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4 max-w-sm px-4">
        <p className="text-6xl font-semibold font-mono text-neutral-300">404</p>
        <h1 className="text-xl font-semibold text-neutral-900">Page not found</h1>
        <p className="text-neutral-500 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Go home
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
