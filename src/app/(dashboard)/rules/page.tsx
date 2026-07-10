import { getRules } from "@/server/actions/rules";
import { getUsers } from "@/server/actions/users";
import { RulesClient } from "@/components/features/rules-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routing Rules",
  description: "Configure how inbound leads are routed to sales reps.",
};

export default async function RulesPage() {
  const [rules, reps] = await Promise.all([getRules(), getUsers("REP")]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Routing Rules</h1>
      <RulesClient rules={rules} reps={reps} />
    </div>
  );
}
