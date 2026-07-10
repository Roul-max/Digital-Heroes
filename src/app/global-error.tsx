"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server-side error tracking in production
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-neutral-50 font-sans">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-4xl font-semibold font-mono text-neutral-300">500</p>
          <h1 className="text-xl font-semibold text-neutral-900">Something went wrong</h1>
          <p className="text-neutral-500 text-sm">An unexpected error occurred. Refresh the page or go back to continue.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              Try again
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-150"
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
