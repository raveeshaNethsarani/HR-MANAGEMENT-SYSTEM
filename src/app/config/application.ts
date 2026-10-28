/**
 * Central, lazy environment config.
 * Values are read on access (not at import time) so `next build` never crashes
 * because an env var is missing in the build environment.
 */
const isProd = process.env.NODE_ENV === "production";

function env(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function secret(name: string): string {
  const v = env(name);
  if (isProd && v.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }
  return v;
}

export const application = {
  isProd,
  get MONGODB_URI() { return env("MONGODB_URI"); },
  get JWT_ACCESS_SECRET() { return secret("JWT_ACCESS_SECRET"); },
  get JWT_REFRESH_SECRET() { return secret("JWT_REFRESH_SECRET"); },

  get APP_URL() { return env("APP_URL", "http://localhost:3000"); },

  get EMAIL_HOST() { return env("EMAIL_HOST"); },
  get EMAIL_PORT() { return Number(env("EMAIL_PORT", "587")); },
  get EMAIL_SECURE() { return env("EMAIL_SECURE", "false") === "true"; },
  get EMAIL_USER() { return env("EMAIL_USER"); },
  get EMAIL_PASSWORD() { return env("EMAIL_PASSWORD"); },
  get EMAIL_FROM() { return env("EMAIL_FROM"); },
  get EMAIL_FROM_NAME() { return env("EMAIL_FROM_NAME", "HR System"); },

  /** One-time secret used by POST /api/auth/bootstrap. Leave empty to disable it. */
  get BOOTSTRAP_SECRET() { return process.env.BOOTSTRAP_SECRET ?? ""; },

  /** If "true", Saturdays and Sundays are not counted as leave days. */
  get LEAVE_EXCLUDE_WEEKENDS() { return process.env.LEAVE_EXCLUDE_WEEKENDS === "true"; },
};
