import { z } from "zod";
import { objectId } from "./common";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .regex(/[a-z]/, "Password needs a lowercase letter")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a digit");

const email = z.string().trim().toLowerCase().email();

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  /** only needed when the same email exists in more than one organization */
  organization_id: objectId.optional(),
});

export const forgotPasswordSchema = z.object({ email, organization_id: objectId.optional() });

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1).max(128),
  new_password: passwordSchema,
});

export const bootstrapSchema = z.object({
  organization: z.object({
    organization_id: z.string().trim().min(3).default("ORG-001"),
    name: z.string().trim().min(2),
    description: z.string().optional(),
  }),
  admin: z.object({
    employee_id: z.string().trim().min(1).default("EMP001"),
    first_name: z.string().trim().min(2).max(50),
    last_name: z.string().trim().min(2).max(50),
    email,
    password: passwordSchema,
  }),
});
