import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import { ApiError, handleError } from "../../../../lib/http";
import { parseBody } from "../../../../lib/validate";
import { rateLimit, getClientIp } from "../../../../lib/rate-limit";
import { randomToken } from "../../../../lib/crypto";
import { setAuthCookies } from "../../../../lib/auth-cookies";
import { loginSchema } from "../../../../validators/auth.schema";
import { Employee } from "../../../../app/models";
import { issueTokens } from "../../../../app/service/auth.service";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../../../app/constant/enums";

let dummyHash: string | undefined;
/** Used so a login for an unknown email takes as long as one for a known email (no user enumeration by timing). */
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash(randomToken(8), 12));

export async function POST(req: Request) {
  try {
    const { email, password, organization_id } = await parseBody(req, loginSchema);

    const ip = getClientIp(req);
    rateLimit(`login-ip:${ip}`, 50, 15 * 60 * 1000);
    rateLimit(`login:${ip}:${email}`, 10, 15 * 60 * 1000);

    await connectDB();

    // the same email may exist in several organizations (unique per organization only)
    const filter: Record<string, any> = { email, employment_status: { $in: ACTIVE_EMPLOYMENT_STATUSES } };
    if (organization_id) filter.organization = organization_id;

    const candidates: any[] = await Employee.find(filter)
      .select("+hash_password")
      .populate({ path: "role", select: "role_name permissions status" })
      .limit(5);

    if (!candidates.length) await bcrypt.compare(password, await getDummyHash());

    const matches: any[] = [];
    for (const c of candidates) {
      if (await bcrypt.compare(password, c.hash_password)) matches.push(c);
    }

    if (!matches.length) throw new ApiError(401, "Invalid credentials");
    if (matches.length > 1) {
      throw new ApiError(409, "This email is used in more than one organization. Please provide organization_id.");
    }

    const user = matches[0];
    if (!user.role || user.role.status !== "active") throw new ApiError(403, "Your role is inactive");

    const { accessToken, refreshToken } = await issueTokens(user._id, user.organization);
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      message: "Logged in",
      user: {
        id: String(user._id),
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization_id: String(user.organization),
        role: user.role.role_name,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
