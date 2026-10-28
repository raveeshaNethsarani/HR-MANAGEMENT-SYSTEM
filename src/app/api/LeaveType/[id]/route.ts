import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { LeaveType, LeaveBalance, LeaveRequest } from "../../../../app/models";
import { leaveTypeUpdateSchema } from "../../../../validators/leaveType.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    await connectDB();
    const item = await LeaveType.findOne({ _id: id, organization: ctx.orgId });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json(item);
  } catch (err) {
    return handleError(err);
  }
}

/** PUT – needs `leaveType.manage`. Changing the allocation also adjusts this year's balances by the difference. */
export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "leaveType.manage");
    const id = assertObjectId((await params).id);
    const data = await parseBody(req, leaveTypeUpdateSchema);

    const existing: any = await LeaveType.findOne({ _id: id, organization: ctx.orgId });
    if (!existing) throw new ApiError(404, "Leave type not found");

    const oldAllocation = existing.anual_allocation;
    Object.assign(existing, data);
    await existing.save();

    if (data.anual_allocation !== undefined && data.anual_allocation !== oldAllocation) {
      await LeaveBalance.updateMany(
        { leave_type_id: existing._id, year: new Date().getFullYear() },
        { $inc: { allocated_days: data.anual_allocation - oldAllocation } }
      );
    }

    return NextResponse.json({ success: true, message: "Leave type updated successfully", data: existing });
  } catch (err) {
    return handleError(err);
  }
}

/** DELETE – needs `leaveType.manage`; refused while leave requests use it. */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "leaveType.manage");
    const id = assertObjectId((await params).id);

    const existing: any = await LeaveType.findOne({ _id: id, organization: ctx.orgId });
    if (!existing) throw new ApiError(404, "Leave type not found");

    if (await LeaveRequest.exists({ organization: ctx.orgId, leave_type: id })) {
      throw new ApiError(409, "Leave requests exist for this leave type, so it cannot be deleted.");
    }

    await LeaveBalance.deleteMany({ leave_type_id: id });
    await existing.deleteOne();
    return NextResponse.json({ success: true, message: "Leave type deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
