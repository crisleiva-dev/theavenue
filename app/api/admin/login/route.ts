import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkCredentials,
  createSessionToken,
  COOKIE_NAME,
  COOKIE_OPTS,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  if (!checkCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = createSessionToken(email);
  const c = await cookies();
  c.set(COOKIE_NAME, token, COOKIE_OPTS);
  return NextResponse.json({ ok: true });
}
