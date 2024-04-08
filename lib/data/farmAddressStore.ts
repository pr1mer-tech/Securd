/* eslint-disable react-hooks/rules-of-hooks */
import { Coins, ReserveInfo } from "../types/save.types"
import { create } from 'zustand'
import { createSelectors } from './createSelectors'
import { CollateralAmountPrice } from "../hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice"
import { CollateralInfos, TokenPrices } from "../types/farm.types"
import { getLtokenprice, getPoolAPY } from "../helpers/lenderPool.helpers"
import { getBorrowAPY, getBorrowAPYLP, getBorrowerPoolBalanceLT, getBorrowerPoolMaxLeverage, getLiquidationThresholdForToken, getMaxLT, getMaxLpApy, getMaximumBorrow, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol, getTotalApy } from "../helpers/borrow.helpers"
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
    totalApy(): number | undefined;
    lpApy(): number | undefined;
    maxLeverageApy(): number | undefined;
    borrowApy(): number | undefined;
    totalBorrowApy(): number | undefined;
    maxBorrow(token: "a" | "b"): bigint | undefined;
    leverage(): number | undefined;
    borrowBalances(): {
        borrowBalanceA: number;
        borrowBalanceB: number;
    } | undefined;
    tokensUSDPrices(): TokenPrices;
    accountBalance(): number | undefined;
    collateralFactor(): number | undefined;
    computeLT(loanA?: number, loanB?: number): number | undefined;
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

    computeLT: (loanA = 0, loanB = 0) => {
        const loanAUSD = (get().borrowBalances()?.borrowBalanceA ?? 0) * (get().tokensUSDPrices().tokenA ?? 0);
        const loanBUSD = (get().borrowBalances()?.borrowBalanceB ?? 0) * (get().tokensUSDPrices().tokenB ?? 0);

        const blt = bigIntToDecimal(get().collateralInfo?.liquidationThresholdInfo.balancedLoanThreshold, get().collateralInfo?.decimals || 18) ?? 0;
        const ult = bigIntToDecimal(get().collateralInfo?.liquidationThresholdInfo.unBalancedLoanThreshold, get().collateralInfo?.decimals || 18) ?? 0;

        const sumLoan = (loanA ?? loanAUSD) + (loanB ?? loanBUSD);

        const LTA = getLiquidationThresholdForToken(
            blt,
            ult,
            loanA ?? loanAUSD,
            sumLoan,
        );

        const LTB = getLiquidationThresholdForToken(
            blt,
            ult,
            loanB ?? loanBUSD,
            sumLoan,
        );

        return Math.max(LTA, LTB);
    },
    totalApy: () => {
        const collateralValueDecimal = bigIntToDecimal(get().collateralAmountPrice?.collateralValue, get().collateralInfo?.decimals || 18);
        const lpApy = get().lpApy();
        const borrowApy = get().borrowApy();

        const loanAUSD = (get().borrowBalances()?.borrowBalanceA ?? 0) * (get().tokensUSDPrices().tokenA ?? 0);
        const loanBUSD = (get().borrowBalances()?.borrowBalanceB ?? 0) * (get().tokensUSDPrices().tokenB ?? 0);

        const priceLoan = loanAUSD + loanBUSD;

        return getTotalApy(collateralValueDecimal, lpApy, priceLoan, borrowApy);
    },
    lpApy: () => {
        // MARK: ANTHONY wanted to have this to be fixed for a demo purpose
        const lpApr = 0.089;

        const lpApy =
            lpApr !== undefined ? getPoolAPY(undefined, lpApr) : undefined;
        return lpApy;
    },
    maxLeverageApy: () => {
        const maxLeverage = getBorrowerPoolMaxLeverage(get().collateralInfo);

        const borrowLpApy = get().totalBorrowApy();

        const lpApy = get().lpApy();

        return getMaxLpApy(maxLeverage, borrowLpApy, lpApy);
    },
    borrowApy: () => {
        const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
            getPairBorrowApy(get().reservesInfo, get().collateralInfo);

        const borrowBalances = get().borrowBalances();
        const tokensUSDPrices = get().tokensUSDPrices();

        const borrowApy = getBorrowAPY(
            tokensUSDPrices,
            borrowPoolAPYA,
            borrowPoolAPYB,
            borrowBalances?.borrowBalanceA,
            borrowBalances?.borrowBalanceB,
        );

        return borrowApy;
    },
    totalBorrowApy: () => {
        const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
            getPairBorrowApy(get().reservesInfo, get().collateralInfo);

        return getBorrowAPYLP(borrowPoolAPYA, borrowPoolAPYB)
    },
    maxBorrow: (token: "a" | "b") => {
        const collateralValueDecimal = bigIntToDecimal(get().collateralAmountPrice?.collateralValue, get().collateralInfo?.decimals || 18) ?? 0;
        const loanAUSD = (get().borrowBalances()?.borrowBalanceA ?? 0) * (get().tokensUSDPrices().tokenA ?? 0);
        const loanBUSD = (get().borrowBalances()?.borrowBalanceB ?? 0) * (get().tokensUSDPrices().tokenB ?? 0);

        const blt = bigIntToDecimal(get().collateralInfo?.liquidationThresholdInfo.balancedLoanThreshold, get().collateralInfo?.decimals || 18) ?? 0;
        const ult = bigIntToDecimal(get().collateralInfo?.liquidationThresholdInfo.unBalancedLoanThreshold, get().collateralInfo?.decimals || 18) ?? 0;
        const buffer = bigIntToDecimal(get().collateralInfo?.liquidationThresholdInfo.buffer, get().collateralInfo?.decimals || 18) ?? 0.1;

        const pairReservesInfosUn = getPairReservesInfos(get().reservesInfo, get().collateralInfo);

        const ltokenPriceA = getLtokenprice(pairReservesInfosUn.reserveInfoTokenA) ?? 0;
        const ltokenPriceB = getLtokenprice(pairReservesInfosUn.reserveInfoTokenB) ?? 0;

        const tokensUSDPrices = getPairPrice(get().coinPrices, get().reservesInfo, get().collateralInfo);

        const collateralA = bigIntToDecimal(get().collateralProportions?.proportions.tokenB, pairReservesInfosUn.reserveInfoTokenB?.decimals) ?? 0;

        const maxDecimals = getMaximumBorrow(
            token,
            loanAUSD,
            loanBUSD,
            blt,
            ult,
            ult,
            buffer,
            ltokenPriceA,
            ltokenPriceB,
            tokensUSDPrices.tokenA ?? 0,
            tokensUSDPrices.tokenB ?? 0,
            collateralA,
            collateralValueDecimal
        );

        return maxDecimals ? BigInt(Math.round(maxDecimals * 1e9)) * 10n ** 9n : 0n;
    },
    leverage: () => {
        const state = get();
        return bigIntToDecimal(state.collateralAmountPrice?.leverageFactor, state.collateralInfo?.decimals || 18);
    },
    borrowBalances: () => {
        const pairReservesInfosUn = getPairReservesInfos(get().reservesInfo, get().collateralInfo);

        const borrowBalances = getPairBorrowBalances(
            get().collateralAmountPrice?.debts,
            pairReservesInfosUn.reserveInfoTokenA,
            pairReservesInfosUn.reserveInfoTokenB
        );

        return borrowBalances;
    },
    tokensUSDPrices: () => {
        const tokensUn = getTokensSymbol(get().collateralInfo);
        const tokensUSDPrices = getPairPrice(get().coinPrices, get().reservesInfo, get().collateralInfo);
        return tokensUSDPrices;
    },
    accountBalance: () => {
        const collateralValueDecimal = bigIntToDecimal(get().collateralAmountPrice?.collateralValue, get().collateralInfo?.decimals || 18) ?? 0;
        const loanAUSD = (get().borrowBalances()?.borrowBalanceA ?? 0) * (get().tokensUSDPrices().tokenA ?? 0);
        const loanBUSD = (get().borrowBalances()?.borrowBalanceB ?? 0) * (get().tokensUSDPrices().tokenB ?? 0);
        const priceLoan = loanAUSD + loanBUSD;
        return collateralValueDecimal - priceLoan;
    },
    collateralFactor: () => {
        return bigIntToDecimal(get().collateralAmountPrice?.collateralFactor, get().collateralInfo?.decimals || 18);
    }
}));

export const useFarmAddressStore = createSelectors(useFarmAddressStoreBase)
export type FarmAddressStoreState = State;