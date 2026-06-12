import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "tav_admin";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET missing or too short");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPw) return false;
  const e1 = Buffer.from(email.trim().toLowerCase());
  const e2 = Buffer.from(adminEmail.trim().toLowerCase());
  const p1 = Buffer.from(password);
  const p2 = Buffer.from(adminPw);
  if (e1.length !== e2.length || p1.length !== p2.length) return false;
  return timingSafeEqual(e1, e2) && timingSafeEqual(p1, p2);
}

export async function isAuthenticated(): Promise<boolean> {
  const c = await cookies();
  return verifySessionToken(c.get(COOKIE_NAME)?.value);
}

export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: MAX_AGE_S,
};
