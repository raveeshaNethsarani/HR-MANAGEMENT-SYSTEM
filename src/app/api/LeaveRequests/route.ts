import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth, hasPermission } from "../../../lib/auth";
import { assertObjectId, handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { LeaveRequest } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { createLeaveRequest, LEAVE_POPULATE, parseDateOnly } from "../../../app/service/leaveRequest.service";
import { LeaveRequestSchema } from "../../../validators/leaveRequest.schema";
import { LEAVE_STATUSES } from "../../../app/constant/enums";

/**
 * POST /api/LeaveRequests – any logged-in employee (for themselves).
 * Body: { leave_type, start_date: "YYYY-MM-DD", end_date, reason?, employee? }   (`employee` needs leave.approve)
 */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req);
    const data = await parseBody(req, LeaveRequestSchema);
    const created = await createLeaveRequest(ctx, data);
    return NextResponse.json(
      { success: true, message: "Leave request created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * GET /api/LeaveRequests
 * Query: page, limit, q, status, employeeId, startDate, endDate
 * Without `leave.read_all` you only ever see your own requests.
 */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter: Record<string, any> = { organization: ctx.orgId };

    if (hasPermission(ctx.permissions, "leave.read_all")) {
      const employeeId = searchParams.get("employeeId");
      if (employeeId) filter.employee = assertObjectId(employeeId, "employeeId");
    } else {
      filter.employee = ctx.userId;
    }

    const status = searchParams.get("status");
    if (status && (LEAVE_STATUSES as readonly string[]).includes(status)) filter.status = status;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate) filter.end_date = { $gte: parseDateOnly(startDate) };
    if (endDate) filter.start_date = { $lte: parseDateOnly(endDate) };

    const result = await paginate(LeaveRequest, {
      ...parseListParams(searchParams),
      searchFields: ["reason"],
      allowedSortFields: ["start_date", "end_date", "status"],
      filter,
      populate: LEAVE_POPULATE,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}
