import { getLeads } from "@/server/actions/leads";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SlaCountdown } from "@/components/features/sla-countdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Leads",
  description: "Your assigned leads with SLA response tracking.",
};

export default async function RepDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { data: leads } = await getLeads({ limit: 25 });
  const slaHours = env.SLA_HOURS;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">My Leads</h1>

      {!leads || leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500 text-sm">No leads assigned to you yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">SLA</th>
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
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.firstResponseAt ? (
                      <span className="text-green-600 text-xs">Responded</span>
                    ) : lead.routedAt ? (
                      <SlaCountdown routedAt={lead.routedAt} slaHours={slaHours} />
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
