"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateRoutingRuleSchema } from "@/types";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

export async function createRule(data: unknown) {
  await requireAdmin();
  const parsed = CreateRoutingRuleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const rule = await prisma.routingRule.create({ data: parsed.data });
  revalidatePath("/rules");
  return { data: rule };
}

export async function updateRule(ruleId: string, data: unknown) {
  await requireAdmin();
  const parsed = CreateRoutingRuleSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const rule = await prisma.routingRule.update({ where: { id: ruleId }, data: parsed.data });
  revalidatePath("/rules");
  return { data: rule };
}

export async function deleteRule(ruleId: string) {
  await requireAdmin();
  await prisma.routingRule.delete({ where: { id: ruleId } });
  revalidatePath("/rules");
  return { success: true };
}

export async function getRules() {
  await requireAdmin();
  return prisma.routingRule.findMany({
    orderBy: { priority: "asc" },
    include: { targetUser: { select: { id: true, email: true, name: true } } },
  });
}

export async function reorderRules(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.routingRule.update({ where: { id }, data: { priority: index + 1 } })
    )
  );
  revalidatePath("/rules");
  return { success: true };
}
