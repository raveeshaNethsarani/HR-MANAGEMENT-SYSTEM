import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { ApiError, handleError } from "../../../../lib/http";
import { clearAuthCookies, getRefreshCookie, setAuthCookies } from "../../../../lib/auth-cookies";
import { rotateRefreshToken } from "../../../../app/service/auth.service";

export async function POST() {
  try {
    const refresh = await getRefreshCookie();
    if (!refresh) throw new ApiError(401, "No refresh token");

    await connectDB();
    const { accessToken, refreshToken } = await rotateRefreshToken(refresh);
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ message: "Refreshed" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) await clearAuthCookies();
    return handleError(err);
  }
}
