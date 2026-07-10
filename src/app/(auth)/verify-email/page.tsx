import { verifyEmail } from "@/server/actions/auth";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
        <p className="text-neutral-600">Missing verification token.</p>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
      {result.success ? (
        <>
          <p className="text-green-700 font-medium mb-4">Email verified successfully!</p>
          <Link href="/login" className="text-blue-600 hover:underline text-sm">
            Sign in to your account →
          </Link>
        </>
      ) : (
        <p className="text-red-600">{result.error}</p>
      )}
    </div>
  );
}
