"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserCapacity, softDeleteUser } from "@/server/actions/users";
import { Trash2, Check } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string | null;
  maxActiveLeads: number | null;
  _count: { assignedLeads: number };
};

export function TeamClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  function handleCapacityChange(id: string, val: number) {
    setEditing((prev) => ({ ...prev, [id]: val }));
  }

  function handleCapacitySave(id: string) {
    const cap = editing[id];
    if (!cap) return;
    startTransition(async () => {
      const result = await updateUserCapacity(id, { maxActiveLeads: cap });
      if (result.error) { toast.error("Failed to update capacity"); return; }
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, maxActiveLeads: cap } : u));
      setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
      toast.success("Capacity updated");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this rep? Their active leads will be unassigned.")) return;
    startTransition(async () => {
      await softDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Rep removed");
    });
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500 text-sm">No reps yet. Invite reps via the register page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr className="text-left text-neutral-500">
            {["Rep", "Active Leads", "Capacity", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-neutral-50 transition-colors duration-150">
              <td className="px-4 py-3">
                <p className="font-medium text-neutral-900">{user.name ?? user.email}</p>
                {user.name && <p className="text-xs text-neutral-400">{user.email}</p>}
              </td>
              <td className="px-4 py-3 font-mono text-neutral-600">{user._count.assignedLeads}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    defaultValue={user.maxActiveLeads ?? 10}
                    onChange={(e) => handleCapacityChange(user.id, parseInt(e.target.value))}
                    className="w-20 px-2 py-1 rounded-md border border-neutral-300 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    disabled={isPending}
                  />
                  {editing[user.id] !== undefined && (
                    <button
                      onClick={() => handleCapacitySave(user.id)}
                      disabled={isPending}
                      aria-label="Save capacity"
                      className="p-1 text-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isPending}
                  aria-label={`Remove ${user.name ?? user.email}`}
                  className="p-2 text-neutral-400 hover:text-red-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
