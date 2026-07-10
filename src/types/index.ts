import { z } from "zod";

// --- Enums ---
export const RoleEnum = z.enum(["ADMIN", "REP"]);
export const LeadStatusEnum = z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]);
export const DistributionMethodEnum = z.enum(["ROUND_ROBIN", "DIRECT_ASSIGN"]);

// --- Base Schemas ---
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: RoleEnum,
  maxActiveLeads: z.number().int().min(0).nullable(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const LeadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  company: z.string().nullable(),
  region: z.string().min(1, "Region is required"),
  dealSize: z.number().int().min(0, "Deal size must be positive"),
  productLine: z.string().min(1, "Product line is required"),
  status: LeadStatusEnum,
  assignedToId: z.string().uuid().nullable(),
  routedAt: z.date().nullable(),
  firstResponseAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoutingRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Rule name is required"),
  criteriaJson: z.record(z.string(), z.any()), // e.g., { region: "NA", minDealSize: 1000 }
  distributionMethod: DistributionMethodEnum,
  targetUserId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  priority: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  actorId: z.string().uuid(),
  action: z.string(),
  metadata: z.record(z.string(), z.any()),
  createdAt: z.date(),
});

// --- Create/Update Payload Schemas ---

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: RoleEnum,
  maxActiveLeads: z.number().int().min(1).nullable().optional(),
}).refine((data) => data.role !== 'REP' || (data.maxActiveLeads !== null && data.maxActiveLeads !== undefined), {
  message: "Reps must have a defined max active leads capacity",
  path: ["maxActiveLeads"],
});

export const UpdateUserCapacitySchema = z.object({
  maxActiveLeads: z.number().int().min(1),
});

export const CreateLeadSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  dealSize: z.number().int().min(0, "Deal size cannot be negative"),
  productLine: z.string().min(1, "Product line is required"),
});

export const UpdateLeadStatusSchema = z.object({
  status: LeadStatusEnum,
  note: z.string().min(1, "Note is required when updating status").optional(),
});

export const CreateRoutingRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  criteriaJson: z.record(z.string(), z.any()),
  distributionMethod: DistributionMethodEnum,
  targetUserId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int(),
}).refine((data) => data.distributionMethod !== 'DIRECT_ASSIGN' || !!data.targetUserId, {
  message: "Target User ID is required for Direct Assignment",
  path: ["targetUserId"],
});

// --- Inferred Types ---
export type User = z.infer<typeof UserSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type RoutingRule = z.infer<typeof RoutingRuleSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
export type CreateRoutingRuleInput = z.infer<typeof CreateRoutingRuleSchema>;
