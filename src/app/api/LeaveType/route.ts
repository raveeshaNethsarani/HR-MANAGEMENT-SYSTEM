import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";
import { handleError } from "../../../lib/http";
import { parseBody } from "../../../lib/validate";
import { LeaveType } from "../../../app/models";
import { paginate, parseListParams } from "../../../app/service/pagination.service";
import { leaveTypeCreateSchema } from "../../../validators/leaveType.schema";
import { initializeBalancesForLeaveType } from "../../../app/service/leaveBalance.service";

/** GET /api/LeaveType – any logged-in employee, scoped to their organization */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    await connectDB();

    const result = await paginate(LeaveType, {
      ...parseListParams(new URL(req.url).searchParams),
      searchFields: ["name", "description", "leave_type_id"],
      allowedSortFields: ["name"],
      filter: { organization: ctx.orgId },
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/LeaveType – needs `leaveType.manage`. Also creates balances for all active employees. */
export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req, "leaveType.manage");
    const data = await parseBody(req, leaveTypeCreateSchema);

    const created: any = await LeaveType.create({ ...data, organization: ctx.orgId });

    try {
      await initializeBalancesForLeaveType(created);
    } catch (e) {
      console.error("Failed to initialize balances for new leave type:", e);
    }

    return NextResponse.json(
      { success: true, message: "Leave type created successfully", data: created },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}
