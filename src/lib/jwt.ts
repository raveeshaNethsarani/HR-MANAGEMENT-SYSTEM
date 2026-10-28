import jwt, { JwtPayload } from "jsonwebtoken";
import { application } from "../app/config/application";

const ALG = "HS256" as const;

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AccessTokenPayload = { sub: string; orgId: string };
export type RefreshTokenPayload = AccessTokenPayload & { jti: string; exp: number };

export function signAccessToken(p: AccessTokenPayload) {
  return jwt.sign({ orgId: p.orgId }, application.JWT_ACCESS_SECRET, {
    algorithm: ALG,
    subject: p.sub,
    expiresIn: ACCESS_TTL_SECONDS,
  });
}

export function signRefreshToken(p: AccessTokenPayload, jti: string) {
  return jwt.sign({ orgId: p.orgId }, application.JWT_REFRESH_SECRET, {
    algorithm: ALG,
    subject: p.sub,
    jwtid: jti,
    expiresIn: REFRESH_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const d = jwt.verify(token, application.JWT_ACCESS_SECRET, { algorithms: [ALG] }) as JwtPayload;
  if (typeof d.sub !== "string" || typeof d.orgId !== "string") throw new Error("Malformed token");
  return { sub: d.sub, orgId: d.orgId };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const d = jwt.verify(token, application.JWT_REFRESH_SECRET, { algorithms: [ALG] }) as JwtPayload;
  if (typeof d.sub !== "string" || typeof d.orgId !== "string" || typeof d.jti !== "string" || !d.exp) {
    throw new Error("Malformed token");
  }
  return { sub: d.sub, orgId: d.orgId, jti: d.jti, exp: d.exp };
}
