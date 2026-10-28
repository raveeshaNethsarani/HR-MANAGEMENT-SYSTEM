import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth, canGrant } from "../../../lib/auth";
import { ApiError, handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { Role } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { roleCreateSchema } from "../../../validators/role.schema";

/** GET /api/Role – needs `role.read` (or `role.manage`). Response shape: { data, meta } */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req, ["role.read", "role.manage"]);
    await connectDB();

    const params = parseListParams(new URL(req.url).searchParams);
    const result = await paginate(Role, {
      ...params,
      searchFields: ["role_name", "description", "role_id"],
      allowedSortFields: ["role_name"],
      filter: { organization: ctx.orgId },
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/Role – needs `role.manage`; you can only grant permissions you hold yourself. */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req, "role.manage");
    const data = await parseBody(req, roleCreateSchema);

    if (!canGrant(ctx, data.permissions)) {
      throw new ApiError(403, "You cannot grant permissions that you do not have yourself");
    }

    const created = await Role.create({ ...data, organization: ctx.orgId });
    return NextResponse.json({ success: true, message: "Role created successfully", data: created }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
