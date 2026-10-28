import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth, canGrant, hasPermission } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { Employee, Role, Designation } from "../../../../app/models";
import { employeeUpdateSchema } from "../../../../validators/employee.schema";
import { revokeAllForEmployee } from "../../../../app/service/auth.service";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../../../app/constant/enums";

type Params = { params: Promise<{ id: string }> };

const POPULATE = [
  { path: "designation", select: "title designation_id" },
  { path: "role", select: "role_name role_id permissions" },
];

/** GET /api/employee/[id] – yourself, or anyone with `employee.read` */
export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    if (id !== ctx.userId && !hasPermission(ctx.permissions, "employee.read")) throw new ApiError(403, "Forbidden");

    await connectDB();
    const employee = await Employee.findOne({ _id: id, organization: ctx.orgId }).populate(POPULATE);
    if (!employee) throw new ApiError(404, "Employee not found");
    return NextResponse.json(employee);
  } catch (err) {
    return handleError(err);
  }
}

/** PUT /api/employee/[id] – needs `employee.update`. Password / organization can NOT be changed here. */
export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "employee.update");
    const id = assertObjectId((await params).id);
    const data = await parseBody(req, employeeUpdateSchema);

    if (data.role) {
      if (id === ctx.userId) throw new ApiError(403, "You cannot change your own role");
      const role: any = await Role.findOne({ _id: data.role, organization: ctx.orgId, status: "active" }).lean();
      if (!role) throw new ApiError(400, "Invalid role for this organization");
      if (!canGrant(ctx, role.permissions ?? [])) {
        throw new ApiError(403, "You cannot assign a role that has more permissions than you have");
      }
    }
    if (data.designation) {
      const ok = await Designation.exists({ _id: data.designation, organization: ctx.orgId });
      if (!ok) throw new ApiError(400, "Invalid designation for this organization");
    }
    if (id === ctx.userId && data.employment_status && data.employment_status !== "Active") {
      throw new ApiError(400, "You cannot deactivate your own account");
    }

    const employee = await Employee.findOneAndUpdate({ _id: id, organization: ctx.orgId }, data, {
      new: true,
      runValidators: true,
    }).populate(POPULATE);
    if (!employee) throw new ApiError(404, "Employee not found");

    // deactivated -> kick out of every session immediately
    if (data.employment_status && !(ACTIVE_EMPLOYMENT_STATUSES as readonly string[]).includes(data.employment_status)) {
      await revokeAllForEmployee(id);
    }

    return NextResponse.json({ success: true, message: "Employee updated successfully", data: employee });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/employee/[id] – needs `employee.delete`.
 * Soft delete: employment_status -> "Terminated" (history, leave records and audit trail are kept).
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "employee.delete");
    const id = assertObjectId((await params).id);
    if (id === ctx.userId) throw new ApiError(400, "You cannot delete your own account");

    const employee = await Employee.findOneAndUpdate(
      { _id: id, organization: ctx.orgId },
      { employment_status: "Terminated" },
      { new: true }
    );
    if (!employee) throw new ApiError(404, "Employee not found");

    await revokeAllForEmployee(id);
    return NextResponse.json({ message: "Employee terminated successfully" });
  } catch (err) {
    return handleError(err);
  }
}
