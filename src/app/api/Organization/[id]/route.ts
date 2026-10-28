import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth, hasPermission } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { Organization, Employee } from "../../../../app/models";
import { organizationUpdateSchema } from "../../../../validators/organization.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    if (id !== ctx.orgId && !ctx.isSystemAdmin) throw new ApiError(404, "Not found");

    await connectDB();
    const org = await Organization.findById(id);
    if (!org) throw new ApiError(404, "Not found");
    return NextResponse.json(org);
  } catch (err) {
    return handleError(err);
  }
}

/** Own organization: `organization.manage`. Any organization / status changes: `system.admin`. */
export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);

    const allowed = ctx.isSystemAdmin || (id === ctx.orgId && hasPermission(ctx.permissions, "organization.manage"));
    if (!allowed) throw new ApiError(403, "Forbidden");

    const data = await parseBody(req, organizationUpdateSchema);
    if (data.status !== undefined && !ctx.isSystemAdmin) {
      throw new ApiError(403, "Only a system admin can change the organization status");
    }

    await connectDB();
    const org = await Organization.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!org) throw new ApiError(404, "Not found");
    return NextResponse.json({ success: true, message: "Organization updated successfully", data: org });
  } catch (err) {
    return handleError(err);
  }
}

/** system.admin only, and only for an organization that has no employees. */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "system.admin");
    const id = assertObjectId((await params).id);
    if (id === ctx.orgId) throw new ApiError(400, "You cannot delete your own organization");

    await connectDB();
    if (await Employee.exists({ organization: id })) {
      throw new ApiError(409, "Organization still has employees. Remove or move them first.");
    }
    const deleted = await Organization.findByIdAndDelete(id);
    if (!deleted) throw new ApiError(404, "Not found");
    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
