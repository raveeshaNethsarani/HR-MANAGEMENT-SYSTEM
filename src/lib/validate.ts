import type { z } from "zod";
import { ApiError } from "./http";

/** Parses + validates the JSON body. Throws ApiError (400 / 422) – catch with handleError(). */
export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(422, "Validation failed", parsed.error.flatten());
  return parsed.data;
}
