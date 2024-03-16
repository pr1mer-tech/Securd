/* eslint-disable react-hooks/rules-of-hooks */
import { Coins, ReserveInfo } from "../types/save.types"
import { StoreApi, UseBoundStore, create } from 'zustand'
import { createSelectors } from './createSelectors'
import { Address } from "viem"
import { CollateralAmountPrice } from "../hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice"
import { CollateralInfos } from "../types/farm.types"
import { getPoolAPY } from "../helpers/lenderPool.helpers"
import { getBorrowAPY, getBorrowAPYLP, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol } from "../helpers/borrow.helpers"
import { bigIntToDecimal } from "../helpers/main.helpers"
import getPairBorrowBalances from "../hooks/getPairBorrowBalances"

type State = {
    coinPrices: Record<keyof Coins, number>,
    reservesInfo: ReserveInfo[],
    collateralInfo?: CollateralInfos,
    collateralAmountPrice?: CollateralAmountPrice,
    borrowerLt: bigint,
    collateralPoolBalance: bigint;
    collateralProportions?: {
        proportions: {
            tokenA: bigint;
            tokenB: bigint;
        };
        collateralPrice: bigint;
    };
    userBalance?: bigint;
}

type Queries = {
    lpApy(): number | undefined;
    borrowApy(): number | undefined;
    leverage(): number | undefined;
}

const useFarmAddressStoreBase = create<State & Queries>((set, get) => ({
    coinPrices: {
        ETH: 0,
        USDC: 0,
        USDT: 0,
        DAI: 0,
        WBTC: 0
    },
    reservesInfo: [],
    collateralInfo: undefined,
    collateralAmountPrice: {},
    borrowerLt: 0n,
    collateralPoolBalance: 0n,
    collateralProportions: undefined,
    userBalance: 0n,

    lpApy: () => {
        // MARK: ANTHONY wanted to have this to be fixed for a demo purpose
        const lpApr = 0.089;

        const lpApy =
            lpApr !== undefined ? getPoolAPY(undefined, lpApr) : undefined;
        return lpApy;
    },
    borrowApy: () => {
        const tokensUn = getTokensSymbol(get().collateralInfo);
        const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
            getPairBorrowApy(get().reservesInfo, tokensUn);

        const pairReservesInfosUn = getPairReservesInfos(get().reservesInfo, tokensUn);

        const borrowBalances = getPairBorrowBalances(
            get().collateralAmountPrice?.debts,
            pairReservesInfosUn.reserveInfoTokenA,
            pairReservesInfosUn.reserveInfoTokenB
        );

        const tokensUSDPrices = getPairPrice(get().coinPrices, get().reservesInfo, tokensUn);

        const borrowApy = getBorrowAPY(
            tokensUSDPrices,
            borrowPoolAPYA,
            borrowPoolAPYB,
            borrowBalances?.borrowBalanceA,
            borrowBalances?.borrowBalanceB,
        );

        return borrowApy;
    },
    leverage: () => {
        const state = get();
        return bigIntToDecimal(state.collateralAmountPrice?.leverageFactor, state.collateralInfo?.decimals || 18);
    }

}));

export const useFarmAddressStore = createSelectors(useFarmAddressStoreBase)
export type FarmAddressStoreState = State;