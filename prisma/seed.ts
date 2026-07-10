import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("demo1234", 12);
  const repHash = await bcrypt.hash("demo1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      name: "Demo Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const rep1 = await prisma.user.upsert({
    where: { email: "rep1@demo.com" },
    update: {},
    create: {
      email: "rep1@demo.com",
      name: "Alice Rep",
      passwordHash: repHash,
      role: "REP",
      maxActiveLeads: 10,
      emailVerified: new Date(),
    },
  });

  const rep2 = await prisma.user.upsert({
    where: { email: "rep2@demo.com" },
    update: {},
    create: {
      email: "rep2@demo.com",
      name: "Bob Rep",
      passwordHash: repHash,
      role: "REP",
      maxActiveLeads: 10,
      emailVerified: new Date(),
    },
  });

  // Default round-robin rule
  await prisma.routingRule.upsert({
    where: { id: "seed-rule-1" },
    update: {},
    create: {
      id: "seed-rule-1",
      name: "Default Round Robin",
      criteriaJson: {},
      distributionMethod: "ROUND_ROBIN",
      isActive: true,
      priority: 1,
    },
  });

  // Sample leads
  const leads = [
    { email: "lead1@acme.com", name: "Jane Smith", company: "Acme Corp", region: "NA", dealSize: 15000, productLine: "Enterprise" },
    { email: "lead2@globex.com", name: "John Doe", company: "Globex", region: "EU", dealSize: 5000, productLine: "Starter" },
    { email: "lead3@initech.com", name: "Sam Lee", company: "Initech", region: "APAC", dealSize: 30000, productLine: "Enterprise" },
  ];

  for (const [i, lead] of leads.entries()) {
    const assignee = i % 2 === 0 ? rep1 : rep2;
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {},
      create: {
        ...lead,
        status: "NEW",
        assignedToId: assignee.id,
        routedAt: new Date(),
      },
    });
  }

  console.log(`✅ Seeded: admin (demo@demo.com), rep1, rep2, 1 rule, ${leads.length} leads`);
  console.log("   Demo credentials: demo@demo.com / demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
