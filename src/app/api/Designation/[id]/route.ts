import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { Designation, Employee } from "../../../../app/models";
import { designationUpdateSchema } from "../../../../validators/designation.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    await connectDB();
    const item = await Designation.findOne({ _id: id, organization: ctx.orgId });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json(item);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "designation.manage");
    const id = assertObjectId((await params).id);
    const data = await parseBody(req, designationUpdateSchema);
    const item = await Designation.findOneAndUpdate({ _id: id, organization: ctx.orgId }, data, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json({ success: true, message: "Designation updated successfully", data: item });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "designation.manage");
    const id = assertObjectId((await params).id);
    if (await Employee.exists({ organization: ctx.orgId, designation: id })) {
      throw new ApiError(409, "This designation is assigned to employees. Reassign them first (or set it Inactive).");
    }
    const item = await Designation.findOneAndDelete({ _id: id, organization: ctx.orgId });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json({ message: "Designation deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
