import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { BalanceLDToken } from "../types/global.types"
import { Address } from "viem"

type State = {
    coinPrices: Record<keyof Coins, number>
    reservesInfo: ReserveInfo[],
    userReservesInfo: ReserveInfo[],
    balanceLDTokens: Record<Address, BalanceLDToken>
    userDeposit: Record<Address, number>
    totalUserDeposit: number,
    totalUserBalance: number,
    averageApy: number
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
    userReservesInfo: [],
    totalUserDeposit: 0,
    totalUserBalance: 0,
    averageApy: 0
}));

export const useSaveStore = createSelectors(useSaveStoreBase)
