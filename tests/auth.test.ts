import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

beforeEach(() => vi.clearAllMocks());

describe("registerUser", () => {
  it("returns field errors for invalid input", async () => {
    const { registerUser } = await import("@/server/actions/auth");
    const fd = new FormData();
    fd.set("email", "not-an-email");
    fd.set("password", "short");
    fd.set("name", "");
    const result = await registerUser(fd);
    expect(result.error).toBeDefined();
  });

  it("returns error if email already registered", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { registerUser } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing" } as never);
    const fd = new FormData();
    fd.set("email", "test@test.com");
    fd.set("password", "password123");
    fd.set("name", "Test User");
    const result = await registerUser(fd);
    expect(result.error).toHaveProperty("email");
  });

  it("creates user and sends verification email on valid input", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { sendVerificationEmail } = await import("@/lib/email");
    const { registerUser } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "new-user" } as never);
    const fd = new FormData();
    fd.set("email", "new@test.com");
    fd.set("password", "password123");
    fd.set("name", "New User");
    const result = await registerUser(fd);
    expect(result.success).toBe(true);
    expect(sendVerificationEmail).toHaveBeenCalledWith("new@test.com", expect.any(String));
  });
});

describe("verifyEmail", () => {
  it("returns error for invalid/expired token", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { verifyEmail } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const result = await verifyEmail("bad-token");
    expect(result.error).toBeDefined();
  });

  it("marks email as verified and clears token", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { verifyEmail } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    const result = await verifyEmail("valid-token");
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verificationToken: null }),
      })
    );
  });
});

describe("requestPasswordReset", () => {
  it("returns success even when email not found (prevents enumeration)", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { sendPasswordResetEmail } = await import("@/lib/email");
    const { requestPasswordReset } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await requestPasswordReset("unknown@test.com", "127.0.0.1");
    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("sends reset email when user exists", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { sendPasswordResetEmail } = await import("@/lib/email");
    const { requestPasswordReset } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    const result = await requestPasswordReset("user@test.com", "127.0.0.1");
    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith("user@test.com", expect.any(String));
  });
});

describe("confirmPasswordReset", () => {
  it("returns error for invalid token", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { confirmPasswordReset } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const result = await confirmPasswordReset("bad-token", "newpassword123");
    expect(result.error).toBeDefined();
  });

  it("rejects passwords shorter than 8 chars", async () => {
    const { confirmPasswordReset } = await import("@/server/actions/auth");
    const result = await confirmPasswordReset("token", "short");
    expect(result.error).toBeDefined();
  });

  it("updates password and invalidates token on success", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { confirmPasswordReset } = await import("@/server/actions/auth");
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    const result = await confirmPasswordReset("valid-token", "newpassword123");
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ resetToken: null, resetTokenExpiry: null }),
      })
    );
  });
});
