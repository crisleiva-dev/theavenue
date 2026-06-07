import { NextResponse } from "next/server";
import { fetchTrains } from "@/lib/trains";

// Needs Node APIs (fs + protobuf decode), and must run per-request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trains = await fetchTrains();
    return NextResponse.json(trains, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
