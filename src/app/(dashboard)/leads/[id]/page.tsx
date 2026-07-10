import { getLead } from "@/server/actions/leads";
import { notFound } from "next/navigation";
import { LeadStatusForm } from "@/components/features/lead-status-form";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLead(id);
  return {
    title: lead ? `${lead.name} — Lead Detail` : "Lead Not Found",
    description: lead ? `Manage lead for ${lead.name} at ${lead.company ?? "unknown company"}.` : undefined,
  };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{lead.name}</h1>
        <p className="text-neutral-500 text-sm mt-1">{lead.email} · {lead.company ?? "No company"}</p>
      </div>

      {/* Lead details */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 grid grid-cols-2 gap-4 text-sm">
        {[
          ["Region", lead.region],
          ["Deal Size", `$${lead.dealSize.toLocaleString()}`],
          ["Product Line", lead.productLine],
          ["Assigned To", (lead as { assignedTo?: { email: string } | null }).assignedTo?.email ?? "Unassigned"],
          ["Routed At", lead.routedAt ? new Date(lead.routedAt).toLocaleString() : "—"],
          ["First Response", lead.firstResponseAt ? new Date(lead.firstResponseAt).toLocaleString() : "Pending"],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-neutral-500">{label}</p>
            <p className="font-medium text-neutral-900 font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Status update */}
      <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />

      {/* Audit log */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">History</h2>
        {lead.auditLogs.length === 0 ? (
          <p className="text-sm text-neutral-500">No history yet.</p>
        ) : (
          <ol className="space-y-3">
            {lead.auditLogs.map((log) => (
              <li key={log.id} className="flex gap-3 text-sm">
                <span className="text-neutral-400 font-mono text-xs w-36 shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <div>
                  <span className="font-medium text-neutral-700">{log.action}</span>
                  {" by "}
                  <span className="text-neutral-500">
                    {(log as { actor?: { email: string } }).actor?.email ?? "system"}
                  </span>
                  {(log.metadata as { note?: string }).note && (
                    <p className="text-neutral-500 mt-0.5 italic">
                      &ldquo;{(log.metadata as { note: string }).note}&rdquo;
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
