import { prisma } from "@/lib/prisma";
import type { Lead, RoutingRule, User } from "@prisma/client";

type CriteriaJson = {
  region?: string;
  minDealSize?: number;
  maxDealSize?: number;
  productLine?: string;
};

function ruleMatches(rule: RoutingRule, lead: Lead): boolean {
  const c = rule.criteriaJson as CriteriaJson;
  if (c.region && c.region !== lead.region) return false;
  if (c.minDealSize !== undefined && lead.dealSize < c.minDealSize) return false;
  if (c.maxDealSize !== undefined && lead.dealSize > c.maxDealSize) return false;
  if (c.productLine && c.productLine !== lead.productLine) return false;
  return true;
}

export async function routeLead(lead: Lead): Promise<User | null> {
  const rules = await prisma.routingRule.findMany({
    where: { isActive: true },
    orderBy: { priority: "asc" },
    include: { targetUser: true },
  });

  for (const rule of rules) {
    if (!ruleMatches(rule, lead)) continue;

    if (rule.distributionMethod === "DIRECT_ASSIGN" && rule.targetUser) {
      const activeCount = await prisma.lead.count({
        where: { assignedToId: rule.targetUserId, status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } },
      });
      const cap = rule.targetUser.maxActiveLeads ?? Infinity;
      if (activeCount < cap) return rule.targetUser;
    }

    if (rule.distributionMethod === "ROUND_ROBIN") {
      // Find eligible reps: not deleted, under capacity, ordered by least-recently assigned
      const reps = await prisma.user.findMany({
        where: { role: "REP", deletedAt: null },
        orderBy: { updatedAt: "asc" }, // proxy for round-robin fairness
      });

      for (const rep of reps) {
        const activeCount = await prisma.lead.count({
          where: { assignedToId: rep.id, status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } },
        });
        const cap = rep.maxActiveLeads ?? 10;
        if (activeCount < cap) return rep;
      }
    }
  }

  return null; // No eligible rep — lead goes to backlog
}
