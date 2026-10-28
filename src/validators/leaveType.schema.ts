import { z } from "zod";

export const leaveTypeCreateSchema = z
  .object({
    leave_type_id: z.string().trim().min(3, "Leave Type ID is required"),
    name: z.string().trim().min(2, "Leave Type Name is required"),
    description: z.string().trim().optional(),
    anual_allocation: z.number().min(0, "Allocation must be at least 0").max(366),
  })
  .strict();

export const leaveTypeUpdateSchema = leaveTypeCreateSchema.partial().strict();
