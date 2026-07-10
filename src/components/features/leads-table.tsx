"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { deleteLead } from "@/server/actions/leads";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  region: string;
  dealSize: number;
  status: string;
  assignedTo?: { email: string; name: string | null } | null;
};

export function LeadsTable({
  leads,
  nextCursor,
  hasFilters,
}: {
  leads: Lead[];
  nextCursor: string | null;
  hasFilters: boolean;
  totalCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ ids: string[]; label: string; allPages?: boolean } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSortBy = searchParams.get("sortBy") ?? "createdAt";
  const currentSortDir = (searchParams.get("sortDir") ?? "desc") as "asc" | "desc";
  const allSelected = leads.length > 0 && selected.size === leads.length;

  function toggleAll() {
    if (allSelected) { setSelected(new Set()); setSelectAllPages(false); }
    else setSelected(new Set(leads.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSort(col: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === col) params.set("sortDir", currentSortDir === "asc" ? "desc" : "asc");
    else { params.set("sortBy", col); params.set("sortDir", "asc"); }
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`);
  }

  function SortIcon({ col }: { col: string }) {
    if (currentSortBy !== col) return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-40" aria-hidden="true" />;
    return currentSortDir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1 inline" aria-hidden="true" />
      : <ChevronDown className="w-3 h-3 ml-1 inline" aria-hidden="true" />;
  }

  function executeDelete(ids: string[], allPages?: boolean) {
    startTransition(async () => {
      await Promise.all((allPages ? leads.map((l) => l.id) : ids).map((id) => deleteLead(id)));
      toast.success(allPages ? "All matching leads deleted" : `${ids.length} lead${ids.length !== 1 ? "s" : ""} deleted`);
      setSelected(new Set());
      setSelectAllPages(false);
      router.refresh();
    });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set("search", value) : params.delete("search");
      params.delete("cursor");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  const sp = searchParams.toString();
  const cursorHref = `/leads?cursor=${nextCursor}${sp ? `&${sp}` : ""}`;

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700",
    CONTACTED: "bg-yellow-50 text-yellow-700",
    QUALIFIED: "bg-purple-50 text-purple-700",
    WON: "bg-green-50 text-green-700",
    LOST: "bg-neutral-100 text-neutral-500",
  };

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        {hasFilters ? (
          <>
            <p className="text-neutral-500 text-sm mb-3">No leads match your filters.</p>
            <Link href="/leads" className="text-blue-600 hover:underline text-sm">Clear filters</Link>
          </>
        ) : (
          <>
            <p className="text-neutral-500 text-sm mb-3">No leads yet.</p>
            <Link href="/leads/new" className="text-blue-600 hover:underline text-sm">Create your first lead →</Link>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!confirm}
        title={`Delete ${confirm?.ids.length === 1 ? "lead" : `${confirm?.ids.length} leads`}?`}
        description={`${confirm?.label} This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (confirm) executeDelete(confirm.ids, confirm.allPages); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-3">
        {/* Search */}
        <input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={handleSearchChange}
          placeholder="Search name, email, company…"
          aria-label="Search leads"
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full sm:w-64"
        />

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <span className="text-blue-700 font-medium">
              {selectAllPages ? "All matching leads" : `${selected.size} on this page`} selected
            </span>
            {allSelected && nextCursor && !selectAllPages && (
              <button onClick={() => setSelectAllPages(true)} className="text-blue-600 hover:underline text-xs">
                Select all across pages
              </button>
            )}
            {selectAllPages && (
              <button onClick={() => { setSelectAllPages(false); setSelected(new Set()); }} className="text-blue-600 hover:underline text-xs">
                Clear all-pages selection
              </button>
            )}
            <button
              onClick={() => setConfirm({
                ids: Array.from(selected),
                label: selectAllPages ? "You are about to delete ALL matching leads." : `You are about to delete ${selected.size} lead${selected.size !== 1 ? "s" : ""}.`,
                allPages: selectAllPages,
              })}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              Delete selected
            </button>
            {!selectAllPages && (
              <button onClick={() => setSelected(new Set())} className="text-blue-600 hover:underline text-xs">
                Clear
              </button>
            )}
          </div>
        )}

        {/* MOBILE: card list (hidden on sm+) */}
        <div className="sm:hidden space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`bg-white rounded-xl border border-neutral-200 p-4 space-y-3 ${selected.has(lead.id) ? "border-blue-300 bg-blue-50/30" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleOne(lead.id)}
                    aria-label={`Select ${lead.name}`}
                    className="rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline font-medium text-sm truncate block">
                      {lead.name}
                    </Link>
                    <p className="text-neutral-400 text-xs truncate">{lead.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[lead.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                  {lead.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <div><span className="text-neutral-400">Company</span><p className="font-medium">{lead.company ?? "—"}</p></div>
                <div><span className="text-neutral-400">Region</span><p className="font-medium">{lead.region}</p></div>
                <div><span className="text-neutral-400">Deal Size</span><p className="font-medium font-mono">${lead.dealSize.toLocaleString()}</p></div>
                <div><span className="text-neutral-400">Assigned</span><p className="font-medium truncate">{lead.assignedTo?.name ?? lead.assignedTo?.email ?? "Unassigned"}</p></div>
              </div>
              <button
                onClick={() => setConfirm({ ids: [lead.id], label: `"${lead.name}" will be deleted.` })}
                disabled={isPending}
                aria-label={`Delete ${lead.name}`}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded disabled:opacity-50 min-h-[44px] px-1"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
              </button>
            </div>
          ))}
        </div>

        {/* DESKTOP: full table (hidden on mobile) */}
        <div className="hidden sm:block bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left text-neutral-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all leads on this page"
                    className="rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </th>
                {([
                  { label: "Name", col: "name" },
                  { label: "Company", col: null },
                  { label: "Region", col: "region" },
                  { label: "Deal Size", col: "dealSize" },
                  { label: "Status", col: "status" },
                  { label: "Assigned To", col: null },
                  { label: "", col: null },
                ] as { label: string; col: string | null }[]).map(({ label, col }) => (
                  <th key={label} className="px-4 py-3 font-medium">
                    {col ? (
                      <button onClick={() => handleSort(col)} className="flex items-center hover:text-neutral-900 transition-colors" aria-label={`Sort by ${label}`}>
                        {label}<SortIcon col={col} />
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-neutral-50 transition-colors duration-150 ${selected.has(lead.id) ? "bg-blue-50/50" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} aria-label={`Select ${lead.name}`} className="rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500" />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline font-medium">{lead.name}</Link>
                    <p className="text-neutral-400 text-xs">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{lead.company ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.region}</td>
                  <td className="px-4 py-3 font-mono text-neutral-600">${lead.dealSize.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{lead.assignedTo?.email ?? "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setConfirm({ ids: [lead.id], label: `"${lead.name}" will be deleted.` })} disabled={isPending} aria-label={`Delete ${lead.name}`} className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded disabled:opacity-50">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-100 text-center">
              <Link href={cursorHref} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>

        {/* Mobile load more */}
        {nextCursor && (
          <div className="sm:hidden text-center">
            <Link href={cursorHref} className="text-sm text-blue-600 hover:underline">Load more</Link>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>{leads.length} lead{leads.length !== 1 ? "s" : ""} shown</span>
          <a href="/api/export" className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export CSV
          </a>
        </div>
      </div>
    </>
  );
}
