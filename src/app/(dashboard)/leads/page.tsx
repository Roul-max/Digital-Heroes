import { getLeads } from "@/server/actions/leads";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description: "Browse, search, and manage all inbound leads.",
};

type SearchParams = Promise<{
  search?: string;
  status?: string;
  region?: string;
  cursor?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { data: leads, nextCursor } = await getLeads({
    search: params.search,
    status: params.status,
    region: params.region,
    cursor: params.cursor,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  });

  const hasFilters = !!(params.search || params.status || params.region);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Leads</h1>
        <Link
          href="/leads/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Add lead
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 flex-wrap">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search name, email, company…"
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-64"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="">All statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors duration-150">
          Filter
        </button>
        {hasFilters && (
          <Link href="/leads" className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Clear filters
          </Link>
        )}
      </form>

      {/* Table */}
      {!leads || leads.length === 0 ? (
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
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left text-neutral-500">
                {["Name", "Company", "Region", "Deal Size", "Status", "Assigned To"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline font-medium">
                      {lead.name}
                    </Link>
                    <p className="text-neutral-400 text-xs">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{lead.company ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{lead.region}</td>
                  <td className="px-4 py-3 font-mono text-neutral-600">${lead.dealSize.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {(lead as { assignedTo?: { email: string } | null }).assignedTo?.email ?? "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nextCursor && (
            <div className="px-4 py-3 border-t border-neutral-100 text-center">
              <Link
                href={`/leads?cursor=${nextCursor}${params.search ? `&search=${params.search}` : ""}${params.status ? `&status=${params.status}` : ""}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
