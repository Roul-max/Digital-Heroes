import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <p className="text-6xl font-semibold font-mono text-neutral-300">404</p>
        <h1 className="text-xl font-semibold text-neutral-900">Page not found</h1>
        <p className="text-neutral-500 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/admin"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
