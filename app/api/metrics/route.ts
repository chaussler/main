import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/connectors";

// Always run fresh — the dashboard polls this and the connectors decide their
// own caching. (For real APIs you'd add per-connector caching to respect rate
// limits, or push updates via webhooks instead of polling.)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}
