"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, FileText, GitBranch, Users, Plus } from "lucide-react";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "leads", label: "Go to Leads", icon: FileText, href: "/leads" },
  { id: "new-lead", label: "Create New Lead", icon: Plus, href: "/leads/new" },
  { id: "rules", label: "Go to Routing Rules", icon: GitBranch, href: "/rules" },
  { id: "team", label: "Go to Team", icon: Users, href: "/team" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const execute = useCallback((href: string) => {
    router.push(href);
    close();
  }, [router, close]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      execute(filtered[activeIndex].href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search commands…"
            className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
            aria-label="Search commands"
            role="combobox"
            aria-expanded={true}
            aria-controls="command-listbox"
            aria-autocomplete="list"
          />
          <kbd className="text-xs text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ul role="listbox" id="command-listbox" className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-neutral-400">No commands found</li>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <li key={cmd.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    onClick={() => execute(cmd.href)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-100 ${
                      i === activeIndex
                        ? "bg-blue-50 text-blue-700"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {cmd.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="px-4 py-2 border-t border-neutral-100 flex gap-4 text-xs text-neutral-400">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
