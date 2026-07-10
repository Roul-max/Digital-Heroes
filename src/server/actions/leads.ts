"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeLead } from "@/lib/routing-engine";
import { CreateLeadSchema, UpdateLeadStatusSchema } from "@/types";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

export async function createLead(data: unknown) {
  const actor = await requireAdmin();
  const parsed = CreateLeadSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.lead.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: { email: ["Lead with this email already exists"] } };

  const lead = await prisma.lead.create({ data: parsed.data });

  // Attempt routing immediately
  const assignee = await routeLead(lead);
  const routedLead = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      assignedToId: assignee?.id ?? null,
      routedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      leadId: lead.id,
      actorId: actor.id,
      action: "ROUTED",
      metadata: { assignedTo: assignee?.id ?? null, rule: "auto" },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/rep");
  return { data: routedLead };
}

export async function updateLeadStatus(leadId: string, data: unknown) {
  const actor = await requireAuth();
  const parsed = UpdateLeadStatusSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: { _: ["Lead not found"] } };

  // Reps can only update their own leads
  if (actor.role === "REP" && lead.assignedToId !== actor.id) {
    return { error: { _: ["Forbidden"] } };
  }

  const prevStatus = lead.status;
  const isFirstResponse = !lead.firstResponseAt && parsed.data.status !== "NEW";

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: parsed.data.status,
      firstResponseAt: isFirstResponse ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      leadId,
      actorId: actor.id,
      action: "STATUS_CHANGED",
      metadata: {
        from: prevStatus,
        to: parsed.data.status,
        note: parsed.data.note ?? null,
      },
    },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/admin");
  revalidatePath("/rep");
  return { data: updated };
}

export async function deleteLead(leadId: string) {
  await requireAdmin();
  const lead = await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin");
  return { data: lead };
}

export async function getLeads(params: {
  search?: string;
  status?: string;
  region?: string;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const actor = await requireAuth();
  const limit = Math.min(params.limit ?? 25, 100);
  const sortBy = params.sortBy ?? "createdAt";
  const sortDir = params.sortDir ?? "desc";

  const where = {
    ...(actor.role === "REP" ? { assignedToId: actor.id } : {}),
    ...(params.status ? { status: params.status as never } : {}),
    ...(params.region ? { region: params.region } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
            { company: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.cursor ? { id: { lt: params.cursor } } : {}),
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ [sortBy]: sortDir }, { id: "desc" }], // stable secondary sort
    take: limit + 1,
    include: { assignedTo: { select: { id: true, email: true, name: true } } },
  });

  const hasMore = leads.length > limit;
  return {
    data: leads.slice(0, limit),
    nextCursor: hasMore ? leads[limit - 1].id : null,
  };
}

export async function getLead(leadId: string) {
  const actor = await requireAuth();
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      assignedTo: { select: { id: true, email: true, name: true } },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, email: true, name: true } } },
      },
    },
  });

  if (!lead) return null;
  if (actor.role === "REP" && lead.assignedToId !== actor.id) return null;
  return lead;
}
