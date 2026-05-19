import { NextRequest, NextResponse } from "next/server";

// XRPL Ledger public RPC. Proxied server-side because the public node
// returns no CORS headers — a direct browser fetch is blocked.
const XRPL_RPC = "https://s.altnet.rippletest.net:51234";

type XrplLine = { account: string; currency: string; balance: string };

async function rpc(method: string, account: string) {
  const res = await fetch(XRPL_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method,
      params: [{ account, ledger_index: "current" }],
    }),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    const [infoJson, linesJson] = await Promise.all([
      rpc("account_info", address) as Promise<{
        result: { account_data?: { Balance?: string } };
      }>,
      rpc("account_lines", address) as Promise<{
        result: { lines?: XrplLine[] };
      }>,
    ]);

    return NextResponse.json({
      xrpDrops: infoJson.result.account_data?.Balance ?? null,
      lines: (linesJson.result.lines ?? []).map((l) => ({
        account: l.account,
        currency: l.currency,
        balance: l.balance,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "XRPL RPC failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
