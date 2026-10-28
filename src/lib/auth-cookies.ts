import { cookies } from "next/headers";
import { application } from "../../src/app/config/application";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS } from "./jwt";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
/** Refresh cookie is only sent to the auth endpoints. */
export const REFRESH_COOKIE_PATH = "/api/auth";

const base = { httpOnly: true, secure: application.isProd, sameSite: "lax" as const };

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const c = await cookies();
  c.set(ACCESS_COOKIE, accessToken, { ...base, path: "/", maxAge: ACCESS_TTL_SECONDS });
  c.set(REFRESH_COOKIE, refreshToken, { ...base, path: REFRESH_COOKIE_PATH, maxAge: REFRESH_TTL_SECONDS });
}

export async function clearAuthCookies() {
  const c = await cookies();
  c.set(ACCESS_COOKIE, "", { ...base, path: "/", maxAge: 0 });
  c.set(REFRESH_COOKIE, "", { ...base, path: REFRESH_COOKIE_PATH, maxAge: 0 });
}

export async function getRefreshCookie() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
