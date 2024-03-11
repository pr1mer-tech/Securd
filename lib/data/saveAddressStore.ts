import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { BalanceLDToken } from "../types/global.types"
import { Address } from "viem"

type State = {
    reserveInfo?: ReserveInfo,
    balanceLDToken: BalanceLDToken,
    coinPrice: number,
    userDeposit: number,
    userBalance: bigint,
}

export const useSaveAddressStoreBase = create<State>((set) => ({
    reserveInfo: undefined,
    balanceLDToken: { dToken: 0n, lToken: 0n },
    coinPrice: 0,
    userDeposit: 0,
    userBalance: 0n,
}));

export const useSaveAddressStore = createSelectors(useSaveAddressStoreBase)
