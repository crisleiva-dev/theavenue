import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { validateItems, writeNews } from "@/lib/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  let items;
  try {
    items = validateItems(body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    await writeNews(items);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items });
}
