import { NextRequest, NextResponse } from "next/server";
import { persistMarketSnapshots } from "@/lib/markets/snapshotIndexer";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  const headerSecret = req.headers.get("x-cron-secret");

  return bearer === secret || headerSecret === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTGRES_CONNECTIONSTRING) {
    return NextResponse.json(
      { error: "POSTGRES_CONNECTIONSTRING is not configured" },
      { status: 500 },
    );
  }

  try {
    const rows = await persistMarketSnapshots();
    return NextResponse.json({
      ok: true,
      indexedMarkets: rows.length,
      snapshotAt: rows[0]?.snapshot_at?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error("[market-snapshots]", err);
    return NextResponse.json(
      { error: "Failed to index market snapshots" },
      { status: 500 },
    );
  }
}
