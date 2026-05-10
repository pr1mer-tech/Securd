"use client";

import { useMarketsStore } from "@/lib/data/marketsStore";

// Step 3 will replace this with proxy address derivation + real contract reads.
export function useUserAccount() {
  const userAccount = useMarketsStore((s) => s.userAccount);
  const isLoading = useMarketsStore((s) => s.isUserLoading);
  return { userAccount, isLoading };
}
