import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit(`export:${ip}`);
  if (!allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { email: true, name: true } } },
  });

  const header = "id,name,email,company,region,deal_size,product_line,status,assigned_to,routed_at,first_response_at,created_at\n";
  const rows = leads
    .map((l) =>
      [
        l.id,
        `"${l.name.replace(/"/g, '""')}"`,
        l.email,
        l.company ? `"${l.company.replace(/"/g, '""')}"` : "",
        l.region,
        l.dealSize,
        l.productLine,
        l.status,
        l.assignedTo?.email ?? "",
        l.routedAt?.toISOString() ?? "",
        l.firstResponseAt?.toISOString() ?? "",
        l.createdAt.toISOString(),
      ].join(",")
    )
    .join("\n");

  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
