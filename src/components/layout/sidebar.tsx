"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, FileText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

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
    <aside className="w-64 min-h-screen bg-white border-r border-neutral-200 flex flex-col">
      <div className="px-6 py-5 border-b border-neutral-200">
        <span className="text-xl font-semibold tracking-tight text-neutral-900">LeadRouter</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
              "hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-neutral-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
