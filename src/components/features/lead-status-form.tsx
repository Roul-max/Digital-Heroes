"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatus } from "@/server/actions/leads";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

export function LeadStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newStatus = fd.get("status") as string;
    const note = fd.get("note") as string;

    const prev = status;
    setStatus(newStatus); // optimistic update

    startTransition(async () => {
      const result = await updateLeadStatus(leadId, { status: newStatus, note });
      if (result.error) {
        setStatus(prev); // rollback
        toast.error("Failed to update status");
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    });
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h2 className="text-base font-semibold text-neutral-900 mb-4">Update Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            disabled={isPending}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Note <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 resize-none"
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
