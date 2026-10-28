import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { application } from "../../src/app/config/application";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function assertObjectId(id: string | null | undefined, label = "id"): string {
  if (!id || !OBJECT_ID.test(id)) throw new ApiError(400, `Invalid ${label}`);
  return id;
}

/** Converts any thrown error into a safe JSON response (no internals leaked). */
export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { message: err.message, ...(err.details ? { errors: err.details } : {}) },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json({ message: "Validation failed", errors: err.flatten() }, { status: 422 });
  }

  const e = err as any;

  if (e?.name === "ValidationError" && e?.errors) {
    const errors = Object.fromEntries(Object.entries(e.errors).map(([k, v]: any) => [k, v.message]));
    return NextResponse.json({ message: "Validation failed", errors }, { status: 422 });
  }

  if (e?.name === "CastError") {
    return NextResponse.json({ message: `Invalid value for "${e.path}"` }, { status: 400 });
  }

  if (e?.code === 11000) {
    const fields = Object.keys(e.keyPattern ?? {}).filter((k) => k !== "organization");
    return NextResponse.json(
      { message: `Duplicate value${fields.length ? ` for: ${fields.join(", ")}` : ""}` },
      { status: 409 }
    );
  }

  console.error("[API ERROR]", err);
  return NextResponse.json(
    { message: application.isProd ? "Internal server error" : e?.message ?? "Internal server error" },
    { status: 500 }
  );
}
