import { NextResponse } from "next/server";
import { fetchTrains } from "@/lib/trains";

// Needs Node APIs (fs + protobuf decode), and must run per-request.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trains = await fetchTrains();
    // Body stays a bare array so that a long-lived client running older JS
    // keeps working — the lobby TV holds one page load for days and cannot
    // pick up a new bundle on its own. The server clock, used by the client
    // to correct for device drift, rides along in a header instead.
    return NextResponse.json(trains, {
      headers: {
        "Cache-Control": "no-store",
        "X-Server-Now-Ms": String(Date.now()),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
