import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { BalanceLDToken } from "../types/global.types"
import { Address } from "viem"

type State = {
    reserveInfo?: ReserveInfo,
    balanceLDToken?: BalanceLDToken,
    coinPrice?: number,
    userDeposit?: bigint,
    userBalance?: bigint,
}

export const useSaveAddressStoreBase = create<State>((set) => ({
    reserveInfo: undefined,
    balanceLDToken: undefined,
    coinPrice: undefined,
    userDeposit: undefined,
    userBalance: undefined,
}));

export const useSaveAddressStore = createSelectors(useSaveAddressStoreBase)
