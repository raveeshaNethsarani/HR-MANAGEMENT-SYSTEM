import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { handleError } from "../../../../lib/http";
import { Employee } from "../../../../app/models";

/** GET /api/employee/all – compact, non-paginated list for dropdowns (max 1000). Needs `employee.read`. */
export async function GET(req: Request) {
  try {
    const ctx = await requireAuth(req, "employee.read");
    await connectDB();

    const data = await Employee.find({ organization: ctx.orgId })
      .select("employee_id first_name last_name email designation role employment_status")
      .populate("designation", "title designation_id")
      .populate("role", "role_name role_id")
      .sort({ first_name: 1, last_name: 1 })
      .limit(1000)
      .lean();

    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
