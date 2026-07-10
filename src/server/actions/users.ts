"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateUserCapacitySchema } from "@/types";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

export async function getUsers(role?: "ADMIN" | "REP") {
  await requireAdmin();
  return prisma.user.findMany({
    where: { deletedAt: null, ...(role ? { role } : {}) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      maxActiveLeads: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { assignedLeads: { where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateUserCapacity(userId: string, data: unknown) {
  await requireAdmin();
  const parsed = UpdateUserCapacitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const user = await prisma.user.update({
    where: { id: userId },
    data: { maxActiveLeads: parsed.data.maxActiveLeads },
    select: { id: true, email: true, maxActiveLeads: true },
  });

  revalidatePath("/team");
  return { data: user };
}

export async function softDeleteUser(userId: string) {
  await requireAdmin();
  // Unassign active leads before soft-deleting
  await prisma.lead.updateMany({
    where: { assignedToId: userId, status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } },
    data: { assignedToId: null },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
    select: { id: true, email: true },
  });

  revalidatePath("/team");
  return { data: user };
}

export async function getDashboardStats() {
  await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [routedToday, respondedLeads, totalLeads, repWorkload] = await Promise.all([
    prisma.lead.count({ where: { routedAt: { gte: todayStart } } }),
    prisma.lead.findMany({
      where: { firstResponseAt: { not: null }, routedAt: { not: null } },
      select: { routedAt: true, firstResponseAt: true },
    }),
    prisma.lead.count(),
    prisma.user.findMany({
      where: { role: "REP", deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        maxActiveLeads: true,
        _count: { select: { assignedLeads: { where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } } } } },
      },
    }),
  ]);

  const slaHours = parseInt(process.env.SLA_HOURS ?? "2");
  const slaMs = slaHours * 60 * 60 * 1000;

  const responseTimes = respondedLeads
    .filter((l) => l.routedAt && l.firstResponseAt)
    .map((l) => l.firstResponseAt!.getTime() - l.routedAt!.getTime());

  const avgResponseMs = responseTimes.length
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const breachedCount = await prisma.lead.count({
    where: {
      routedAt: { lt: new Date(Date.now() - slaMs) },
      firstResponseAt: null,
    },
  });

  return {
    routedToday,
    avgResponseMinutes: Math.round(avgResponseMs / 60000),
    slaBreachRate: totalLeads > 0 ? Math.round((breachedCount / totalLeads) * 100) : 0,
    repWorkload: repWorkload.map((r) => ({
      id: r.id,
      name: r.name ?? r.email,
      activeLeads: r._count.assignedLeads,
      capacity: r.maxActiveLeads ?? 10,
    })),
  };
}
