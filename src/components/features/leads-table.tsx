"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Download } from "lucide-react";
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
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ ids: string[]; label: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allSelected = leads.length > 0 && selected.size === leads.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function executeDelete(ids: string[]) {
    startTransition(async () => {
      await Promise.all(ids.map((id) => deleteLead(id)));
      setSelected(new Set());
      toast.success(`${ids.length} lead${ids.length !== 1 ? "s" : ""} deleted`);
      router.refresh();
    });
  }

  // Debounced search — updates URL after 300ms
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.delete("cursor");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  const sp = searchParams.toString();
  const cursorHref = `/leads?cursor=${nextCursor}${sp ? `&${sp}` : ""}`;

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        {hasFilters ? (
          <>
            <p className="text-neutral-500 text-sm mb-3">No leads match your filters.</p>
            <Link href="/leads" className="text-blue-600 hover:underline text-sm">
              Clear filters
            </Link>
          </>
        ) : (
          <>
            <p className="text-neutral-500 text-sm mb-3">No leads yet.</p>
            <Link href="/leads/new" className="text-blue-600 hover:underline text-sm">
              Create your first lead →
            </Link>
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
        onConfirm={() => {
          if (confirm) executeDelete(confirm.ids);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />

      <div className="space-y-3">
        {/* Inline debounced search */}
        <input
          type="search"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={handleSearchChange}
          placeholder="Search name, email, company…"
          aria-label="Search leads"
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-64"
        />

        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <span className="text-blue-700 font-medium">{selected.size} selected</span>
            <button
              onClick={() =>
                setConfirm({
                  ids: Array.from(selected),
                  label: `You are about to delete ${selected.size} lead${selected.size !== 1 ? "s" : ""}.`,
                })
              }
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              Delete selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-blue-600 hover:underline text-xs"
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left text-neutral-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all leads"
                    className="rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </th>
                {["Name", "Company", "Region", "Deal Size", "Status", "Assigned To", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-neutral-50 transition-colors duration-150 ${
                    selected.has(lead.id) ? "bg-blue-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                      aria-label={`Select ${lead.name}`}
                      className="rounded border-neutral-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-neutral-400 text-xs">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{lead.company ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.region}</td>
                  <td className="px-4 py-3 font-mono text-neutral-600">
                    ${lead.dealSize.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {lead.assignedTo?.email ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setConfirm({ ids: [lead.id], label: `"${lead.name}" will be deleted.` })
                      }
                      disabled={isPending}
                      aria-label={`Delete ${lead.name}`}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-100 text-center">
              <Link href={cursorHref} className="text-sm text-blue-600 hover:underline">
                Load more
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} shown
          </span>
          <a
            href="/api/export"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export CSV
          </a>
        </div>
      </div>
    </>
  );
}
