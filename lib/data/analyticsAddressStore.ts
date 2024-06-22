import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import type { GraphContextData } from "@/components/analytics/address/Graphs";

type State = {
    timeRange: "1m" | "3m" | "1y";
    leverage: number;
    tokenDirection: boolean;
    graph: GraphContextData;
}

export const useAnalyticsAddressStoreBase = create<State>((set) => ({
    timeRange: "1m",
    leverage: 1,
    tokenDirection: true,
    graph: [],
}));

export const useAnalyticsAddressStore = createSelectors(useAnalyticsAddressStoreBase)
