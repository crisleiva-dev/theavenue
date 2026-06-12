import { NextResponse } from "next/server";
import { readNews } from "@/lib/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await readNews();
  return NextResponse.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}
