import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { BalanceLDToken } from "../types/global.types"
import { Address } from "viem"

type State = {
    reserveInfo?: ReserveInfo,
}

export const useSaveAddressStoreBase = create<State>((set) => ({
    reserveInfo: undefined,
}));

export const useSaveAddressStore = createSelectors(useSaveAddressStoreBase)
