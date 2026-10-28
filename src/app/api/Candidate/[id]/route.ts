import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/auth";
import { ApiError, assertObjectId, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { Candidate } from "../../../../app/models";
import { candidateUpdateSchema } from "../../../../validators/candidate.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, ["candidate.read", "candidate.manage"]);
    const id = assertObjectId((await params).id);
    await connectDB();
    const item = await Candidate.findOne({ _id: id, organization: ctx.orgId });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json(item);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "candidate.manage");
    const id = assertObjectId((await params).id);
    const data = await parseBody(req, candidateUpdateSchema);
    const item = await Candidate.findOneAndUpdate({ _id: id, organization: ctx.orgId }, data, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json({ success: true, message: "Candidate updated successfully", data: item });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const ctx = await requireAuth(req, "candidate.manage");
    const id = assertObjectId((await params).id);
    const item = await Candidate.findOneAndDelete({ _id: id, organization: ctx.orgId });
    if (!item) throw new ApiError(404, "Not found");
    return NextResponse.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    return handleError(err);
  }
}
