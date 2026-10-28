import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import { requireAuth, hasPermission } from "../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../lib/http";
import { Employee } from "../../../app/models";
import { getEmployeeBalances } from "../../../app/service/leaveBalance.service";

/**
 * GET /api/LeaveBalance?employeeId=&year=
 * Defaults to the logged-in user and the current year. Other employees need `leave.read_all`.
 */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const employeeId = searchParams.get("employeeId") ? assertObjectId(searchParams.get("employeeId"), "employeeId") : ctx.userId;
    if (employeeId !== ctx.userId && !hasPermission(ctx.permissions, "leave.read_all")) {
      throw new ApiError(403, "Forbidden");
    }

    const year = Number(searchParams.get("year") ?? new Date().getFullYear());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new ApiError(400, "Invalid year");

    await connectDB();
    if (!(await Employee.exists({ _id: employeeId, organization: ctx.orgId }))) throw new ApiError(404, "Employee not found");

    const balances = await getEmployeeBalances(employeeId, year);
    return NextResponse.json({ success: true, data: balances });
  } catch (err) {
    return handleError(err);
  }
}
