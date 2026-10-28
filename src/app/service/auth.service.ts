import { randomUUID } from "crypto";
import { Employee, RefreshToken } from "../../app/models";
import { ApiError } from "../../lib/http";
import { sha256, randomToken } from "../../lib/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_TTL_SECONDS } from "../../lib/jwt";
import { ACTIVE_EMPLOYMENT_STATUSES } from "../../app/constant/enums";

type Id = string | { toString(): string };

/** Issues an access + refresh token pair and stores the refresh token (hashed) for rotation. */
export async function issueTokens(employeeId: Id, orgId: Id) {
  const payload = { sub: String(employeeId), orgId: String(orgId) };
  const jti = randomUUID();
  await RefreshToken.create({
    employee: payload.sub,
    token_hash: sha256(jti),
    expires_at: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  });
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload, jti) };
}

/**
 * Refresh-token rotation: each refresh token works exactly once.
 * If an already-used token shows up again (theft), every session of that employee is revoked.
 */
export async function rotateRefreshToken(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Refresh failed");
  }

  const hash = sha256(payload.jti);
  const record = await RefreshToken.findOneAndUpdate(
    { token_hash: hash, revoked_at: null, expires_at: { $gt: new Date() } },
    { revoked_at: new Date() }
  );

  if (!record) {
    if (await RefreshToken.exists({ token_hash: hash })) await revokeAllForEmployee(payload.sub);
    throw new ApiError(401, "Refresh failed");
  }

  const emp: any = await Employee.findById(payload.sub).select("organization employment_status").lean();
  if (!emp || !(ACTIVE_EMPLOYMENT_STATUSES as readonly string[]).includes(emp.employment_status)) {
    throw new ApiError(401, "Refresh failed");
  }
  return issueTokens(emp._id, emp.organization);
}

export async function revokeRefreshToken(token: string) {
  try {
    const { jti } = verifyRefreshToken(token);
    await RefreshToken.updateOne({ token_hash: sha256(jti), revoked_at: null }, { revoked_at: new Date() });
  } catch {
    /* expired / invalid token – nothing to revoke */
  }
}

export async function revokeAllForEmployee(employeeId: Id) {
  await RefreshToken.updateMany({ employee: String(employeeId), revoked_at: null }, { revoked_at: new Date() });
}

/** Creates a one-time password setup/reset token. Only its hash is stored; the raw token goes in the email. */
export async function createPasswordToken(employeeId: Id, ttlMs: number) {
  const raw = randomToken(32);
  await Employee.updateOne(
    { _id: String(employeeId) },
    { $set: { reset_token_hash: sha256(raw), reset_token_expires: new Date(Date.now() + ttlMs) } }
  );
  return raw;
}
