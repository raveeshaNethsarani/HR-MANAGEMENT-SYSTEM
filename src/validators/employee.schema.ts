import { z } from "zod";
import { EMPLOYMENT_STATUSES } from "../app/constant/enums";
import { objectId, phone, dateString } from "./common";

/**
 * NOTE: organization is NOT part of the body – it always comes from the logged-in user.
 * `designation` / `role` are the ObjectIds returned by /api/Designation and /api/Role.
 */
export const employeeCreateSchema = z
  .object({
    designation: objectId,
    role: objectId,
    employee_id: z.string().trim().min(1, "Employee ID is required").max(30),

    first_name: z.string().trim().min(2, "First name must be at least 2 characters").max(50),
    last_name: z.string().trim().min(2, "Last name must be at least 2 characters").max(50),

    email: z.string().trim().toLowerCase().email("Invalid email address"),
    phone,

    address: z.string().trim().max(200).optional(),
    date_of_birth: dateString.optional(),
    join_date: dateString.optional(),

    employment_status: z.enum(EMPLOYMENT_STATUSES).default("Active"),
  })
  .strict();

export const employeeUpdateSchema = employeeCreateSchema
  .partial()
  .extend({ phone: phone.optional(), employment_status: z.enum(EMPLOYMENT_STATUSES).optional() })
  .strict();
