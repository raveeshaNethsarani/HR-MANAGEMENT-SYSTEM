import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

/** Accepts "+94 77-123 4567" style input, stores digits only (with optional leading +). */
export const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"));

export const dateString = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date format" });

/** Calendar date, send as YYYY-MM-DD (an ISO datetime is accepted; only its date part is used). */
export const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "Use YYYY-MM-DD")
  .refine((v) => !isNaN(Date.parse(v.slice(0, 10))), { message: "Invalid date" });
