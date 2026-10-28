import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { ApiError, handleError } from "../../../../lib/http";
import { requireAuth } from "../../../../lib/auth";
import { parseBody } from "../../../../lib/validate";
import { setAuthCookies } from "../../../../lib/auth-cookies";
import { changePasswordSchema } from "../../../../validators/auth.schema";
import { Employee } from "../../../../app/models";
import { issueTokens, revokeAllForEmployee } from "../../../../app/service/auth.service";

export async function POST(req: Request) {
  try {
    const ctx = await requireAuth(req);
    const { current_password, new_password } = await parseBody(req, changePasswordSchema);

    await connectDB();
    const emp: any = await Employee.findById(ctx.userId).select("+hash_password");
    if (!emp || !(await bcrypt.compare(current_password, emp.hash_password))) {
      throw new ApiError(400, "Current password is incorrect");
    }

    await Employee.updateOne(
      { _id: ctx.userId },
      { $set: { hash_password: await bcrypt.hash(new_password, 12), password_changed_at: new Date() } }
    );

    // sign out every other session, keep this one
    await revokeAllForEmployee(ctx.userId);
    const { accessToken, refreshToken } = await issueTokens(ctx.userId, ctx.orgId);
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ message: "Password changed" });
  } catch (err) {
    return handleError(err);
  }
}
