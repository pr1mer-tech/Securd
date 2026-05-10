import { create } from "zustand";
import type { MarketData, UserAccount } from "@/lib/types/market.types";

type MarketsState = {
  markets: MarketData[];
  userAccount: UserAccount | null;
  isMarketsLoading: boolean;
  isUserLoading: boolean;

  setMarkets: (markets: MarketData[]) => void;
  setUserAccount: (account: UserAccount | null) => void;
  setMarketsLoading: (v: boolean) => void;
  setUserLoading: (v: boolean) => void;
};

export const useMarketsStore = create<MarketsState>((set) => ({
  markets: [],
  userAccount: null,
  isMarketsLoading: true,
  isUserLoading: true,

  setMarkets: (markets) => set({ markets, isMarketsLoading: false }),
  setUserAccount: (userAccount) => set({ userAccount, isUserLoading: false }),
  setMarketsLoading: (v) => set({ isMarketsLoading: v }),
  setUserLoading: (v) => set({ isUserLoading: v }),
}));
