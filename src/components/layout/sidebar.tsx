"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, FileText, LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/features/command-palette";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: FileText },
  { href: "/rules", label: "Routing Rules", icon: GitBranch },
  { href: "/team", label: "Team", icon: Users },
];

const repLinks = [
  { href: "/rep", label: "My Leads", icon: FileText },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? adminLinks : repLinks;
  return (
    <>
      <CommandPalette />
      <aside className="w-16 sm:w-64 min-h-screen bg-white border-r border-neutral-200 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-neutral-200 hidden sm:block">
          <span className="text-xl font-semibold tracking-tight text-neutral-900">LeadRouter</span>
        </div>
        {/* Cmd+K trigger */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
          className="mx-3 mt-3 hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Open command palette"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-xs border border-neutral-200 rounded px-1 py-0.5 font-mono">⌘K</kbd>
        </button>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center sm:justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[44px]",
                "hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-200">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center sm:justify-start gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px]"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
