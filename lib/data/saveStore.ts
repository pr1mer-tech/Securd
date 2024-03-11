import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { BalanceLDToken } from "../types/global.types"
import { Address } from "viem"

type State = {
    coinPrices: Record<keyof Coins, number>
    reservesInfo: ReserveInfo[],
    balanceLDTokens: Record<Address, BalanceLDToken>
    userDeposit: Record<Address, bigint>
}

export const useSaveStoreBase = create<State>((set) => ({
    coinPrices: {
        ETH: 0,
        USDC: 0,
        USDT: 0,
        DAI: 0,
        WBTC: 0
    },
    reservesInfo: [],
    balanceLDTokens: {},
    userDeposit: {},
}));

export const useSaveStore = createSelectors(useSaveStoreBase)
