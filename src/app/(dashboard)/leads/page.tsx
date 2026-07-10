import { getLeads } from "@/server/actions/leads";
import { LeadsTable } from "@/components/features/leads-table";
import Link from "next/link";
import { Suspense } from "react";
import { TableSkeleton, Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description: "Browse, search, and manage all inbound leads.",
  alternates: { canonical: "/leads" },
};

type SearchParams = Promise<{
  search?: string;
  status?: string;
  region?: string;
  cursor?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}>;

async function LeadsContent({ params }: { params: Awaited<SearchParams> }) {
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
    <LeadsTable
      leads={leads ?? []}
      nextCursor={nextCursor}
      hasFilters={hasFilters}
    />
  );
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
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

      {/* Status + region filters — URL-driven so state is shareable */}
      <form className="flex gap-3 flex-wrap items-center">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="">All statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          name="region"
          defaultValue={params.region ?? ""}
          placeholder="Filter by region…"
          className="px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-44"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors duration-150"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/leads"
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Clear filters
          </Link>
        )}
      </form>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <TableSkeleton rows={8} cols={7} />
          </div>
        }
      >
        <LeadsContent params={params} />
      </Suspense>
    </div>
  );
}
