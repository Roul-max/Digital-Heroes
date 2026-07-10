import { getUsers } from "@/server/actions/users";
import { TeamClient } from "@/components/features/team-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
  description: "Manage sales reps and their lead capacity.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const users = await getUsers("REP");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Team</h1>
      <TeamClient users={users} />
    </div>
  );
}
