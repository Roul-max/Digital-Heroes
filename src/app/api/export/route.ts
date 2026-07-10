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
  const { allowed, retryAfter } = await checkRateLimit(`export:${ip}`);
  if (!allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { email: true, name: true } } },
  });

  const header = "id,name,email,company,region,deal_size,product_line,status,assigned_to,routed_at,first_response_at,created_at\n";

  // Stream rows one at a time — avoids building a giant string in memory
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(header));
      for (const l of leads) {
        const row = [
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
        ].join(",") + "\n";
        controller.enqueue(enc.encode(row));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Transfer-Encoding": "chunked",
    },
  });
}
