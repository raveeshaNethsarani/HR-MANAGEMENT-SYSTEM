import { cookies } from "next/headers";
import { application } from "../../src/app/config/application";
import { connectDB } from "./db";
import { ACCESS_COOKIE } from "./auth-cookies";
import { verifyAccessToken } from "./jwt";
import { ApiError } from "./http";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../src/app/constant/enums";
import { Employee } from "../../src/app/models"; // also registers every model for populate()

export type AuthContext = {
  userId: string;
  orgId: string;
  roleId: string;
  permissions: string[];
  isSystemAdmin: boolean;
  user: { first_name: string; last_name: string; email: string; employee_id: string };
};

/** "*" = every organization-level permission, but never the system.* ones. */
export function hasPermission(perms: string[], needed: string) {
  if (perms.includes(needed)) return true;
  return perms.includes("*") && !needed.startsWith("system.");
}

/** A user may only hand out permissions they hold themselves (prevents privilege escalation). */
export function canGrant(ctx: AuthContext, permissions: string[]) {
  return permissions.every((p) => hasPermission(ctx.permissions, p));
}

/** CSRF defence for cookie-authenticated, state-changing requests. */
function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser client
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, "Invalid origin");
  }
  const allowed = new Set<string>();
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) allowed.add(host);
  try {
    allowed.add(new URL(application.APP_URL).host);
  } catch {}
  if (!allowed.has(originHost)) throw new ApiError(403, "Cross-site request blocked");
}

/**
 * Authenticates the request (cookie or `Authorization: Bearer`) and optionally checks permission(s).
 * Permissions are loaded from the DB on every call, so role changes / terminations apply immediately.
 * Pass several permissions to allow ANY of them.
 */
export async function requireAuth(req: Request, permission?: string | string[]): Promise<AuthContext> {
  let token: string | undefined;
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    token = header.slice(7).trim();
  } else {
    token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) assertSameOrigin(req);
  }
  if (!token) throw new ApiError(401, "Authentication required");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  await connectDB();
  const emp: any = await Employee.findById(payload.sub)
    .select("organization role employment_status first_name last_name email employee_id")
    .populate({ path: "role", select: "permissions status" })
    .lean();

  if (!emp || !(ACTIVE_EMPLOYMENT_STATUSES as readonly string[]).includes(emp.employment_status)) {
    throw new ApiError(401, "Account is not active");
  }
  if (String(emp.organization) !== payload.orgId) throw new ApiError(401, "Invalid token");
  if (!emp.role || emp.role.status !== "active") throw new ApiError(403, "Your role is inactive");

  const permissions: string[] = emp.role.permissions ?? [];
  const ctx: AuthContext = {
    userId: String(emp._id),
    orgId: String(emp.organization),
    roleId: String(emp.role._id),
    permissions,
    isSystemAdmin: permissions.includes("system.admin"),
    user: {
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      employee_id: emp.employee_id,
    },
  };

  if (permission) {
    const list = Array.isArray(permission) ? permission : [permission];
    if (!list.some((p) => hasPermission(permissions, p))) throw new ApiError(403, "Forbidden");
  }
  return ctx;
}
