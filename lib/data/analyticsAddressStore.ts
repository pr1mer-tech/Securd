import { create } from "zustand";
import { createSelectors } from "./createSelectors";

type State = {
    timeRange: "1m" | "3m" | "1y";
}

export const useAnalyticsAddressStoreBase = create<State>((set) => ({
    timeRange: "1m",
}));

export const useAnalyticsAddressStore = createSelectors(useAnalyticsAddressStoreBase)
