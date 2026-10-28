import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";
import { assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import {
  getLeaveRequestForUser,
  updateLeaveRequest,
  changeLeaveStatus,
} from "../../../../app/service/leaveRequest.service";
import { leaveRequestStatusSchema, leaveRequestUpdateSchema } from "../../../../validators/leaveRequest.schema";

type Params = { params: Promise<{ id: string }> };

/** GET – the owner, or anyone with `leave.read_all` */
export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    const data = await getLeaveRequestForUser(ctx, id);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return handleError(err);
  }
}

/** PUT – the owner edits dates/reason of a PENDING request */
export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    const body = await parseBody(req, leaveRequestUpdateSchema);
    const data = await updateLeaveRequest(ctx, id, body);
    return NextResponse.json({ success: true, message: "Leave request updated successfully", data });
  } catch (err) {
    return handleError(err);
  }
}

/** DELETE – cancels the request (soft delete). Owner or `leave.approve`. Balance is restored automatically. */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    const data = await changeLeaveStatus(ctx, id, "cancelled");
    return NextResponse.json({ success: true, message: "Leave request cancelled successfully", data });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PATCH – body { status: "approved" | "rejected" | "cancelled" }  (case-insensitive)
 * approve/reject need `leave.approve`; the approver is always the logged-in user.
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req);
    const id = assertObjectId((await params).id);
    const { status } = await parseBody(req, leaveRequestStatusSchema);
    const data = await changeLeaveStatus(ctx, id, status);
    return NextResponse.json({ success: true, message: `Leave request ${status} successfully`, data });
  } catch (err) {
    return handleError(err);
  }
}
