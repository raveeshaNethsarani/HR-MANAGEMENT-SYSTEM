import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { Organization } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { organizationCreateSchema } from "../../../validators/organization.schema";

/**
 * GET /api/Organization
 *  - system.admin: every organization (paginated, searchable)
 *  - everyone else: only their own organization
 */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    await connectDB();

    const params = parseListParams(new URL(req.url).searchParams);
    const result = await paginate(Organization, {
      ...params,
      searchFields: ["name", "description", "organization_id"],
      allowedSortFields: ["name"],
      filter: ctx.isSystemAdmin ? {} : { _id: ctx.orgId },
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/Organization – system.admin only */
export async function POST(req: Request) {
  try {
    await requireAuth(req, "system.admin");
    const data = await parseBody(req, organizationCreateSchema);
    const created = await Organization.create(data);
    return NextResponse.json(
      { success: true, message: "Organization created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
