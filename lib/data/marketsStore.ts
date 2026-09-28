import { create } from "zustand";
import type { MarketData, UserAccount } from "@/lib/types/market.types";

type MarketsState = {
  markets: MarketData[];
  userAccount: UserAccount | null;
  isMarketsLoading: boolean;
  isUserLoading: boolean;
  userRefreshNonce: number;
  /**
   * XRPL hash of the intent currently relaying through Axelar, or null.
   * The adapter nonce is strictly sequential — only one intent may be
   * in-flight at a time, otherwise the next intent reads a stale nonce.
   */
  pendingTxHash: string | null;

  setMarkets: (markets: MarketData[]) => void;
  setUserAccount: (account: UserAccount | null) => void;
  setMarketsLoading: (v: boolean) => void;
  setUserLoading: (v: boolean) => void;
  triggerUserRefresh: () => void;
  setPendingTxHash: (hash: string | null) => void;
};

export const useMarketsStore = create<MarketsState>((set) => ({
  markets: [],
  userAccount: null,
  isMarketsLoading: true,
  isUserLoading: true,
  userRefreshNonce: 0,
  pendingTxHash: null,

  setMarkets: (markets) => set({ markets, isMarketsLoading: false }),
  setUserAccount: (userAccount) => set({ userAccount, isUserLoading: false }),
  setMarketsLoading: (v) => set({ isMarketsLoading: v }),
  setUserLoading: (v) => set({ isUserLoading: v }),
  triggerUserRefresh: () => set((s) => ({ userRefreshNonce: s.userRefreshNonce + 1 })),
  setPendingTxHash: (pendingTxHash) => set({ pendingTxHash }),
}));
