"use client";

import { useEffect } from "react";
import { useMarketsData } from "@/lib/hooks/useMarketsData";
import { useUserData } from "@/lib/hooks/useUserData";
import { usePendingIntentWatcher } from "@/lib/hooks/usePendingIntentWatcher";
import { useAccount } from "@/lib/xrpl/walletContext";

/**
 * Mounts data-fetching hooks that hydrate the Zustand markets store.
 * Renders nothing — exists only to run side-effects inside the markets layout.
 */
export function ContractDataSync() {
  useMarketsData();
  useUserData();
  usePendingIntentWatcher();

  const { address } = useAccount();
  useEffect(() => {
    if (!address) return;
    fetch("/api/register-user", {
      method: "POST",
      headers: { "x-xrpl-address": address },
    }).catch((err) => console.error("[register-user]", err));
  }, [address]);

  return null;
}
