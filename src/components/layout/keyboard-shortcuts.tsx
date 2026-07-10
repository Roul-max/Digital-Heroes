"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts for the dashboard:
 *  /        → focus the search input
 *  j        → move focus to next table row link
 *  k        → move focus to previous table row link
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // / → focus search (only when not already in an input)
      if (e.key === "/" && !isEditing) {
        e.preventDefault();
        const search =
          document.querySelector<HTMLInputElement>("input[type='search']") ??
          document.querySelector<HTMLInputElement>("input[name='search']");
        search?.focus();
        return;
      }

      if (isEditing) return;

      // j/k → navigate table row links
      if (e.key === "j" || e.key === "k") {
        const links = Array.from(
          document.querySelectorAll<HTMLAnchorElement>("tbody tr td a[href]")
        );
        if (links.length === 0) return;
        const focused = document.activeElement;
        const idx = links.indexOf(focused as HTMLAnchorElement);
        if (e.key === "j") {
          links[idx + 1]?.focus();
        } else {
          links[Math.max(0, idx - 1)]?.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
