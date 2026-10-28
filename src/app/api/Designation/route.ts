import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { Designation } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { designationCreateSchema } from "../../../validators/designation.schema";

/** GET /api/Designation – any logged-in employee, scoped to their organization */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    await connectDB();

    const params = parseListParams(new URL(req.url).searchParams);
    const result = await paginate(Designation, {
      ...params,
      searchFields: ["title", "description", "designation_id"],
      allowedSortFields: ["title"],
      filter: { organization: ctx.orgId },
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/Designation – needs `designation.manage` */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req, "designation.manage");
    const data = await parseBody(req, designationCreateSchema);
    const created = await Designation.create({ ...data, organization: ctx.orgId });
    return NextResponse.json(
      { success: true, message: "Designation created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
