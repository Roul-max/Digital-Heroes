"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLead } from "@/server/actions/leads";

const fields = [
  { name: "name", label: "Full Name", type: "text", optional: false },
  { name: "email", label: "Email", type: "email", optional: false },
  { name: "company", label: "Company", type: "text", optional: true },
  { name: "region", label: "Region", type: "text", optional: false },
  { name: "dealSize", label: "Deal Size ($)", type: "number", optional: false },
  { name: "productLine", label: "Product Line", type: "text", optional: false },
] as const;

export default function NewLeadPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      company: (fd.get("company") as string) || undefined,
      region: fd.get("region") as string,
      dealSize: parseInt(fd.get("dealSize") as string, 10),
      productLine: fd.get("productLine") as string,
    };

    startTransition(async () => {
      const result = await createLead(data);
      if (result.error) {
        const msgs = Object.values(result.error).flat().join(", ");
        toast.error(msgs);
        return;
      }
      toast.success("Lead created and routed!");
      router.push("/leads");
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">New Lead</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ name, label, type, optional }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1.5">
                {label}{" "}
                {optional && <span className="text-neutral-400 font-normal">(optional)</span>}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required={!optional}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                disabled={isPending}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {isPending ? "Creating…" : "Create & Route Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}
