"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "@/lib/xrpl/walletContext";
import type { MarketData } from "@/lib/types/market.types";

type XrplBalances = {
  // Native XRP in drops (bigint)
  xrpDrops: bigint | null;
  // IOU trust lines keyed as "<CURRENCY>:<ISSUER>" → human-readable balance string
  lines: Map<string, string>;
};

// Calls the same-origin /api/xrpl-balance route, which proxies the XRPL
// Ledger RPC server-side (the public node sends no CORS headers, so a
// direct browser fetch is blocked).
async function fetchXrplBalances(address: string): Promise<XrplBalances> {
  const res = await fetch(
    `/api/xrpl-balance?address=${encodeURIComponent(address)}`,
  );
  if (!res.ok) {
    throw new Error(`XRPL balance request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    xrpDrops: string | null;
    lines: { account: string; currency: string; balance: string }[];
  };

  const xrpDrops = data.xrpDrops ? BigInt(data.xrpDrops) : null;

  const lines = new Map<string, string>();
  for (const line of data.lines) {
    const key = `${line.currency}:${line.account}`;
    lines.set(key, line.balance);
  }

  return { xrpDrops, lines };
}

export function useXrplBalance() {
  const { address: xrplAddress } = useAccount();
  const [balances, setBalances] = useState<XrplBalances>({
    xrpDrops: null,
    lines: new Map(),
  });
  const [isLoading, setIsLoading] = useState(false);
  // Keep a ref so the interval cleanup doesn't capture stale state
  const addressRef = useRef(xrplAddress);
  addressRef.current = xrplAddress;

  const refresh = useCallback(async () => {
    if (!addressRef.current) {
      setBalances({ xrpDrops: null, lines: new Map() });
      return;
    }
    setIsLoading(true);
    try {
      const result = await fetchXrplBalances(addressRef.current);
      setBalances(result);
    } catch (err) {
      // Keep previous balances on transient error
      console.error("useXrplBalance: failed to fetch XRPL balances", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!xrplAddress) {
      setBalances({ xrpDrops: null, lines: new Map() });
      return;
    }
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [xrplAddress, refresh]);

  /**
   * Returns the wallet balance for any market:
   * - Native XRP market (no xrplCurrency/xrplIssuer) → XRP float from account_info
   * - IOU market (has xrplCurrency + xrplIssuer) → trust line balance from account_lines
   * Returns null if not connected or the trust line doesn't exist.
   */
  function getWalletBalance(market: Pick<MarketData, "xrplCurrency" | "xrplIssuer" | "underlyingDecimals">): number | null {
    if (!market.xrplCurrency || !market.xrplIssuer) {
      // Native XRP
      return balances.xrpDrops !== null
        ? Number(balances.xrpDrops) / 1e6
        : null;
    }
    // IOU
    const key = `${market.xrplCurrency}:${market.xrplIssuer}`;
    const raw = balances.lines.get(key);
    return raw !== undefined ? parseFloat(raw) : null;
  }

  return { getWalletBalance, isLoading, refresh };
}
