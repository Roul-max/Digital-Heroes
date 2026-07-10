import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
