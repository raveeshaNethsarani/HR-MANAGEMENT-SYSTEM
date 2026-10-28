import { z } from "zod";
import { ALL_PERMISSIONS } from "../app/constant/permissions";

const permissions = z
  .array(z.enum(ALL_PERMISSIONS))
  .transform((arr) => Array.from(new Set(arr)));

export const roleCreateSchema = z
  .object({
    role_id: z.string().trim().min(3),
    role_name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    permissions: permissions.default([]),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .strict();

export const roleUpdateSchema = z
  .object({
    role_id: z.string().trim().min(3),
    role_name: z.string().trim().min(2),
    description: z.string().trim(),
    permissions,
    status: z.enum(["active", "inactive"]),
  })
  .partial()
  .strict();
