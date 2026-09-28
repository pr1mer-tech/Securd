"use client";

import { useEffect } from "react";
import { useMarketsStore } from "@/lib/data/marketsStore";
import { useAxelarStatus } from "@/lib/xrpl/useAxelarStatus";

/**
 * Watches the in-flight intent (`pendingTxHash`) and releases the global
 * submission lock once Axelar finishes relaying it.
 *
 * Lives outside any modal so the lock clears even if the user closes the
 * TxStatusModal ("Track in background"). On success it also refreshes user
 * data so the new on-chain position shows up.
 *
 * Mounted once, in ContractDataSync.
 */
export function usePendingIntentWatcher() {
  const pendingTxHash = useMarketsStore((s) => s.pendingTxHash);
  const setPendingTxHash = useMarketsStore((s) => s.setPendingTxHash);
  const triggerUserRefresh = useMarketsStore((s) => s.triggerUserRefresh);

  const status = useAxelarStatus(pendingTxHash ?? undefined);

  useEffect(() => {
    if (!pendingTxHash || !status) return;

    if (status.isComplete) {
      // Intent executed on XRPL EVM — nonce has advanced, position changed.
      setPendingTxHash(null);
      triggerUserRefresh();
    } else if (status.isFailed) {
      // Failed relay does not advance the nonce — just release the lock.
      setPendingTxHash(null);
    }
  }, [pendingTxHash, status, setPendingTxHash, triggerUserRefresh]);
}
