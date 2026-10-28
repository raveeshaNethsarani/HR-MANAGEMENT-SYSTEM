import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { Candidate } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { candidateCreateSchema } from "../../../validators/candidate.schema";
import { CANDIDATE_STATUSES } from "../../../app/constant/enums";

/** GET /api/Candidate – needs `candidate.read`. Optional ?status= filter. */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req, ["candidate.read", "candidate.manage"]);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const filter: Record<string, any> = { organization: ctx.orgId };
    if (status && (CANDIDATE_STATUSES as readonly string[]).includes(status)) filter.status = status;

    const result = await paginate(Candidate, {
      ...parseListParams(searchParams),
      searchFields: ["first_name", "last_name", "email", "current_position", "skills"],
      allowedSortFields: ["first_name", "status"],
      filter,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/Candidate – needs `candidate.manage` */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req, "candidate.manage");
    const data = await parseBody(req, candidateCreateSchema);
    const created = await Candidate.create({ ...data, organization: ctx.orgId });
    return NextResponse.json(
      { success: true, message: "Candidate created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
