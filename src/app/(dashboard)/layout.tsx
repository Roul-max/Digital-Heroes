import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} />
      <main className="flex-1 p-4 sm:p-8 overflow-auto min-w-0" id="main-content">
        <KeyboardShortcuts />
        {children}
      </main>
    </div>
  );
}
