import { create } from "zustand";
import { createSelectors } from "./createSelectors";

type State = {
    timeRange: "1m" | "3m" | "1y";
    leverage: number;
    tokenDirection: boolean;
}

export const useAnalyticsAddressStoreBase = create<State>((set) => ({
    timeRange: "1m",
    leverage: 1,
    tokenDirection: true,
}));

export const useAnalyticsAddressStore = createSelectors(useAnalyticsAddressStoreBase)
