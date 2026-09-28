"use client";

import { useMarketsStore } from "@/lib/data/marketsStore";

// Step 3 will replace this with real contract reads via xrplEvmClient.
// For now it exposes the store state that Step 3 will hydrate.
export function useMarkets() {
  const markets = useMarketsStore((s) => s.markets);
  const isLoading = useMarketsStore((s) => s.isMarketsLoading);
  return { markets, isLoading };
}
