import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import { clearAuthCookies, getRefreshCookie } from "../../../../lib/auth-cookies";
import { revokeRefreshToken } from "../../../../app/service/auth.service";
import "../../../../app/models";

export async function POST() {
  const refresh = await getRefreshCookie();
  if (refresh) {
    try {
      await connectDB();
      await revokeRefreshToken(refresh); // server-side revoke, not just cookie removal
    } catch (err) {
      console.error("[logout] could not revoke refresh token", err);
    }
  }
  await clearAuthCookies();
  return NextResponse.json({ message: "Logged out" });
}
