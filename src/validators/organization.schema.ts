import { z } from "zod";

export const organizationCreateSchema = z
  .object({
    organization_id: z.string().trim().min(3, "Organization ID must be at least 3 characters"),
    name: z.string().trim().min(2, "Organization name must be at least 2 characters"),
    description: z.string().trim().optional(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .strict();

export const organizationUpdateSchema = z
  .object({
    organization_id: z.string().trim().min(3),
    name: z.string().trim().min(2),
    description: z.string().trim(),
    status: z.enum(["Active", "Inactive"]),
  })
  .partial()
  .strict();
