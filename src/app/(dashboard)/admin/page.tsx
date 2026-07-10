import { getDashboardStats } from "@/server/actions/users";
import { getLeads } from "@/server/actions/leads";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of lead routing activity, SLA performance, and rep workload.",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/rep");

  const [stats, { data: recentLeads }] = await Promise.all([
    getDashboardStats(),
    getLeads({ limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Leads routed today", value: stats.routedToday },
          { label: "Avg response time", value: `${stats.avgResponseMinutes}m` },
          { label: "SLA breach rate", value: `${stats.slaBreachRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-3xl font-semibold font-mono mt-1 text-neutral-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Workload distribution */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Rep Workload</h2>
        {stats.repWorkload.length === 0 ? (
          <p className="text-sm text-neutral-500">No reps configured yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.repWorkload.map((rep) => (
              <div key={rep.id} className="flex items-center gap-4">
                <span className="text-sm text-neutral-700 w-40 truncate">{rep.name}</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min((rep.activeLeads / rep.capacity) * 100, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={rep.activeLeads}
                    aria-valuemax={rep.capacity}
                    aria-label={`${rep.name} workload`}
                  />
                </div>
                <span className="text-sm font-mono text-neutral-500 w-16 text-right">
                  {rep.activeLeads}/{rep.capacity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent Leads</h2>
        {recentLeads && recentLeads.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="py-2 text-neutral-900">{lead.name}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2 text-neutral-500">
                    {(lead as { assignedTo?: { email: string } | null }).assignedTo?.email ?? "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-neutral-500">No leads yet. <Link href="/leads" className="text-blue-600 hover:underline">Create your first lead →</Link></p>
        )}
      </div>
    </div>
  );
}
