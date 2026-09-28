import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getMarketSnapshotHistory } from "@/lib/markets/snapshotIndexer";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ cToken: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  if (!process.env.POSTGRES_CONNECTIONSTRING) {
    return NextResponse.json({
      points: [],
      warning: "POSTGRES_CONNECTIONSTRING is not configured",
    });
  }

  const { cToken } = await params;
  if (!isAddress(cToken)) {
    return NextResponse.json({ error: "Invalid cToken address" }, { status: 400 });
  }

  const daysParam = req.nextUrl.searchParams.get("days");
  const days = daysParam ? Number.parseInt(daysParam, 10) : 30;

  try {
    const points = await getMarketSnapshotHistory({
      cToken,
      days: Number.isFinite(days) ? days : 30,
    });
    return NextResponse.json({ points });
  } catch (err) {
    console.error("[market-history]", err);
    return NextResponse.json(
      { error: "Failed to load market history" },
      { status: 500 },
    );
  }
}
