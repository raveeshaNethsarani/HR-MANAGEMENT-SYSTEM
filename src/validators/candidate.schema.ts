import { z } from "zod";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "@/src/app/constant/enums";

export const candidateCreateSchema = z
  .object({
    candidate_id: z.string().trim().min(3),
    first_name: z.string().trim().min(2).max(50),
    last_name: z.string().trim().min(2).max(50),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().min(8).max(15),
    current_position: z.string().trim().min(2).max(100).optional(),
    experience_years: z.number().min(0).max(50).optional(),
    skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
    source: z.enum(CANDIDATE_SOURCES).default("Other"),
    status: z.enum(CANDIDATE_STATUSES).default("Applied"),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const candidateUpdateSchema = candidateCreateSchema
  .partial()
  .extend({
    source: z.enum(CANDIDATE_SOURCES).optional(),
    status: z.enum(CANDIDATE_STATUSES).optional(),
  })
  .strict();
