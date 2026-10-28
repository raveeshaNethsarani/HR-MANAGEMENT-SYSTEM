import { z } from "zod";

export const designationCreateSchema = z
  .object({
    designation_id: z.string().trim().min(3, "Designation ID must be at least 3 characters"),
    title: z.string().trim().min(2, "Title must be at least 2 characters"),
    description: z.string().trim().optional(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .strict();

export const designationUpdateSchema = z
  .object({
    designation_id: z.string().trim().min(3),
    title: z.string().trim().min(2),
    description: z.string().trim(),
    status: z.enum(["Active", "Inactive"]),
  })
  .partial()
  .strict();
