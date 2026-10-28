import { z } from "zod";
import { objectId, calendarDate } from "./common";

/** `employee` is optional: it defaults to the logged-in user (HR with leave.approve may set another employee). */
export const LeaveRequestSchema = z
  .object({
    employee: objectId.optional(),
    leave_type: objectId,
    start_date: calendarDate,
    end_date: calendarDate,
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const leaveRequestUpdateSchema = z
  .object({
    start_date: calendarDate.optional(),
    end_date: calendarDate.optional(),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

/** status is case-insensitive: "Approved" / "approved" both work. */
export const leaveRequestStatusSchema = z.object({
  status: z
    .string()
    .transform((s) => s.toLowerCase())
    .pipe(z.enum(["approved", "rejected", "cancelled"])),
});
