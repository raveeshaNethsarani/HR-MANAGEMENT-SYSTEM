import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth, canGrant } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { Role, Employee } from "../../../../app/models";
import { roleUpdateSchema } from "../../../../validators/role.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, ["role.read", "role.manage"]);
    const id = assertObjectId((await params).id);
    await connectDB();
    const role = await Role.findOne({ _id: id, organization: ctx.orgId });
    if (!role) throw new ApiError(404, "Not found");
    return NextResponse.json(role);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "role.manage");
    const id = assertObjectId((await params).id);
    const data = await parseBody(req, roleUpdateSchema);

    const existing: any = await Role.findOne({ _id: id, organization: ctx.orgId });
    if (!existing) throw new ApiError(404, "Not found");

    // can't edit a role that is more powerful than you, and can't grant more than you have
    if (!canGrant(ctx, existing.permissions ?? []) || (data.permissions && !canGrant(ctx, data.permissions))) {
      throw new ApiError(403, "You cannot grant or modify permissions that you do not have yourself");
    }

    Object.assign(existing, data);
    await existing.save();
    return NextResponse.json({ success: true, message: "Role updated successfully", data: existing });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "role.manage");
    const id = assertObjectId((await params).id);

    const existing: any = await Role.findOne({ _id: id, organization: ctx.orgId });
    if (!existing) throw new ApiError(404, "Not found");
    if (!canGrant(ctx, existing.permissions ?? [])) {
      throw new ApiError(403, "You cannot delete a role that is more powerful than yours");
    }
    if (await Employee.exists({ organization: ctx.orgId, role: id })) {
      throw new ApiError(409, "This role is assigned to employees. Reassign them first (or set it inactive).");
    }

    await existing.deleteOne();
    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
