import { NextResponse } from "next/server";
import { ApiError, handleError } from "../../../../lib/http";
import { requireAuth } from "../../../../lib/auth";

/** Returns the logged-in user + permissions (or { user: null } when not logged in). */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    return NextResponse.json({
      user: {
        id: ctx.userId,
        organization_id: ctx.orgId,
        role_id: ctx.roleId,
        permissions: ctx.permissions,
        ...ctx.user,
      },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return NextResponse.json({ user: null });
    return handleError(err);
  }
}
