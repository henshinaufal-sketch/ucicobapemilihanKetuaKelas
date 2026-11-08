import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

function sessionValue() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("admin-session-v1").digest("hex");
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminCookieValue() {
  return sessionValue();
}

export async function isAdmin() {
  const expected = sessionValue();
  if (!expected) return false;
  const got = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  return got.length === expected.length && timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}
