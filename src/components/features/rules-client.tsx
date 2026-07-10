"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createRule, deleteRule } from "@/server/actions/rules";
import { Trash2 } from "lucide-react";

type Rep = { id: string; email: string; name: string | null };
type Rule = {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  distributionMethod: string;
  criteriaJson: unknown;
  targetUser: Rep | null;
};

export function RulesClient({ rules: initial, reps }: { rules: Rule[]; reps: Rep[] }) {
  const [rules, setRules] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const method = fd.get("distributionMethod") as string;
    const data = {
      name: fd.get("name") as string,
      distributionMethod: method,
      targetUserId: method === "DIRECT_ASSIGN" ? (fd.get("targetUserId") as string) : null,
      isActive: true,
      priority: rules.length + 1,
      criteriaJson: {
        region: (fd.get("region") as string) || undefined,
        minDealSize: fd.get("minDealSize") ? parseInt(fd.get("minDealSize") as string) : undefined,
        productLine: (fd.get("productLine") as string) || undefined,
      },
    };

    startTransition(async () => {
      const result = await createRule(data);
      if (result.error) { toast.error("Failed to create rule"); return; }
      // createRule returns the raw record without targetUser — attach it from local reps list
      const targetUser = data.targetUserId
        ? (reps.find((r) => r.id === data.targetUserId) ?? null)
        : null;
      setRules((prev) => [...prev, { ...(result.data as unknown as Rule), targetUser }]);
      setShowForm(false);
      toast.success("Rule created");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success("Rule deleted");
    });
  }

  return (
    <div className="space-y-4">
      {rules.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-500 text-sm mb-3">No routing rules yet.</p>
          <button onClick={() => setShowForm(true)} className="text-blue-600 hover:underline text-sm">
            Create your first rule →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">{rule.name}</p>
                <p className="text-xs text-neutral-500">
                  Priority {rule.priority} · {rule.distributionMethod}
                  {rule.targetUser ? ` → ${rule.targetUser.name ?? rule.targetUser.email}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                disabled={isPending}
                aria-label={`Delete rule ${rule.name}`}
                className="p-2 text-neutral-400 hover:text-red-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">New Rule</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "name", label: "Rule Name", required: true },
                { name: "region", label: "Region (optional)" },
                { name: "minDealSize", label: "Min Deal Size (optional)", type: "number" },
                { name: "productLine", label: "Product Line (optional)" },
              ].map(({ name, label, required, type }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
                  <input
                    id={name} name={name} type={type ?? "text"} required={required}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label htmlFor="distributionMethod" className="block text-sm font-medium text-neutral-700 mb-1.5">Distribution</label>
              <select id="distributionMethod" name="distributionMethod" className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="DIRECT_ASSIGN">Direct Assign</option>
              </select>
            </div>
            <div>
              <label htmlFor="targetUserId" className="block text-sm font-medium text-neutral-700 mb-1.5">Target Rep (for Direct Assign)</label>
              <select id="targetUserId" name="targetUserId" className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <option value="">— none —</option>
                {reps.map((r) => <option key={r.id} value={r.id}>{r.name ?? r.email}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-150">
                {isPending ? "Saving…" : "Save Rule"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Add rule
        </button>
      )}
    </div>
  );
}
