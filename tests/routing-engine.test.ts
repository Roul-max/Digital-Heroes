import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Lead } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    routingRule: { findMany: vi.fn() },
    lead: { count: vi.fn() },
    user: { findMany: vi.fn() },
  },
}));

const mockLead: Lead = {
  id: "lead-1",
  email: "test@test.com",
  name: "Test Lead",
  company: null,
  region: "NA",
  dealSize: 10000,
  productLine: "Enterprise",
  status: "NEW",
  assignedToId: null,
  routedAt: null,
  firstResponseAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRep = {
  id: "rep-1",
  email: "rep@test.com",
  name: "Rep One",
  passwordHash: "hash",
  role: "REP" as const,
  maxActiveLeads: 10,
  emailVerified: new Date(),
  verificationToken: null,
  verificationTokenExpiry: null,
  resetToken: null,
  resetTokenExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const makeRule = (overrides: Record<string, unknown> = {}) => ({
  id: "rule-1",
  name: "Test Rule",
  criteriaJson: {},
  distributionMethod: "ROUND_ROBIN",
  targetUserId: null,
  targetUser: null,
  isActive: true,
  priority: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("routeLead", () => {
  it("returns null when no active rules exist", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([]);
    expect(await routeLead(mockLead)).toBeNull();
  });

  it("skips a rule that does not match the lead region", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([
      makeRule({ criteriaJson: { region: "EU" } }) as never,
    ]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    expect(await routeLead(mockLead)).toBeNull();
  });

  it("assigns via DIRECT_ASSIGN when rep is under capacity", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([
      makeRule({ distributionMethod: "DIRECT_ASSIGN", targetUserId: mockRep.id, targetUser: mockRep }) as never,
    ]);
    vi.mocked(prisma.lead.count).mockResolvedValue(0);
    expect((await routeLead(mockLead))?.id).toBe(mockRep.id);
  });

  it("skips DIRECT_ASSIGN when rep is at capacity", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([
      makeRule({ distributionMethod: "DIRECT_ASSIGN", targetUserId: mockRep.id, targetUser: { ...mockRep, maxActiveLeads: 5 } }) as never,
    ]);
    vi.mocked(prisma.lead.count).mockResolvedValue(5);
    expect(await routeLead(mockLead)).toBeNull();
  });

  it("assigns first available rep in ROUND_ROBIN", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([makeRule() as never]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockRep] as never);
    vi.mocked(prisma.lead.count).mockResolvedValue(0);
    expect((await routeLead(mockLead))?.id).toBe(mockRep.id);
  });

  it("returns null when all ROUND_ROBIN reps are at capacity", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([makeRule() as never]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ ...mockRep, maxActiveLeads: 3 }] as never);
    vi.mocked(prisma.lead.count).mockResolvedValue(3);
    expect(await routeLead(mockLead)).toBeNull();
  });

  it("respects minDealSize criteria — skips rule when deal is too small", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { routeLead } = await import("@/lib/routing-engine");
    vi.mocked(prisma.routingRule.findMany).mockResolvedValue([
      makeRule({ criteriaJson: { minDealSize: 50000 } }) as never,
    ]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockRep] as never);
    // lead.dealSize = 10000 < 50000
    expect(await routeLead(mockLead)).toBeNull();
  });
});
