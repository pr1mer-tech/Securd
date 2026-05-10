"use client";

import { useMarketsData } from "@/lib/hooks/useMarketsData";
import { useUserData } from "@/lib/hooks/useUserData";

/**
 * Mounts data-fetching hooks that hydrate the Zustand markets store.
 * Renders nothing — exists only to run side-effects inside the markets layout.
 */
export function ContractDataSync() {
  useMarketsData();
  useUserData();
  return null;
}
