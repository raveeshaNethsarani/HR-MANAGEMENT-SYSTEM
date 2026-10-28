import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { ApiError, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { sha256 } from "../../../../lib/crypto";
import { rateLimit, getClientIp } from "../../../../lib/rate-limit";
import { resetPasswordSchema } from "../../../../validators/auth.schema";
import { Employee } from "../../../../app/models";
import { revokeAllForEmployee } from "../../../../app/service/auth.service";

/** Used both for "forgot password" and for the first-time password setup link in the welcome email. */
export async function POST(req: Request) {
  try {
    rateLimit(`reset-ip:${getClientIp(req)}`, 20, 15 * 60 * 1000);
    const { token, password } = await parseBody(req, resetPasswordSchema);

    await connectDB();
    const hash = await bcrypt.hash(password, 12);

    // atomic: the token can be used exactly once
    const emp: any = await Employee.findOneAndUpdate(
      { reset_token_hash: sha256(token), reset_token_expires: { $gt: new Date() } },
      {
        $set: { hash_password: hash, password_changed_at: new Date() },
        $unset: { reset_token_hash: "", reset_token_expires: "" },
      }
    );
    if (!emp) throw new ApiError(400, "Invalid or expired token");

    await revokeAllForEmployee(emp._id); // log out every existing session
    return NextResponse.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    return handleError(err);
  }
}
