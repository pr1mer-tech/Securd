import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { Address } from "viem"
import { CollateralAmountPrice } from "../hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice"
import { CollateralInfos } from "../types/farm.types"

type State = {
    coinPrices: Record<keyof Coins, number>,
    reservesInfo: ReserveInfo[],
    collateralsInfos: CollateralInfos[],
    collateralAmountPrice: Record<Address, CollateralAmountPrice>;
    borrowerLt: Record<Address, bigint>;
    collateralPoolBalances: Record<Address, bigint>;
    collateralProportions: Record<Address, {
        proportions: {
            tokenA: bigint;
            tokenB: bigint;
        };
        collateralPrice: bigint;
    }>;
}

export const useFarmStoreBase = create<State>((set) => ({
    coinPrices: {
        ETH: 0,
        USDC: 0,
        USDT: 0,
        DAI: 0,
        WBTC: 0
    },
    reservesInfo: [],
    collateralsInfos: [],
    collateralAmountPrice: {},
    borrowerLt: {},
    collateralPoolBalances: {},
    collateralProportions: {}
}));

export const useFarmStore = createSelectors(useFarmStoreBase)
export type FarmStoreState = State;
