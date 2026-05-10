"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "@hyper-gate/react";
import type { MarketConfig } from "@/lib/constants/markets";

const XRPL_RPC = "https://s.altnet.rippletest.net:51234";

type XrplBalances = {
  // Native XRP in drops (bigint)
  xrpDrops: bigint | null;
  // IOU trust lines keyed as "<CURRENCY>:<ISSUER>" → human-readable balance string
  lines: Map<string, string>;
};

async function fetchXrplBalances(address: string): Promise<XrplBalances> {
  const [infoRes, linesRes] = await Promise.all([
    fetch(XRPL_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_info",
        params: [{ account: address, ledger_index: "current" }],
      }),
    }),
    fetch(XRPL_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "account_lines",
        params: [{ account: address, ledger_index: "current" }],
      }),
    }),
  ]);

  const [infoJson, linesJson] = await Promise.all([
    infoRes.json() as Promise<{
      result: { account_data?: { Balance?: string }; error?: string };
    }>,
    linesRes.json() as Promise<{
      result: {
        lines?: { account: string; currency: string; balance: string }[];
        error?: string;
      };
    }>,
  ]);

  const rawBalance = infoJson.result.account_data?.Balance;
  const xrpDrops = rawBalance ? BigInt(rawBalance) : null;

  const lines = new Map<string, string>();
  for (const line of linesJson.result.lines ?? []) {
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
    } catch {
      // Keep previous balances on transient error
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
  function getWalletBalance(market: Pick<MarketConfig, "xrplCurrency" | "xrplIssuer" | "underlyingDecimals">): number | null {
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
