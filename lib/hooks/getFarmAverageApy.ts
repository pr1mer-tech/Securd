import { getBorrowAPY, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol, getTotalApy } from "../helpers/borrow.helpers";
import { getPoolAPY } from "../helpers/lenderPool.helpers";
import { bigIntToDecimal } from "../helpers/main.helpers";
import { CollateralInfos } from "../types/farm.types";
import { Coins, ReserveInfo } from "../types/save.types";
import getPairBorrowBalances from "./getPairBorrowBalances";
import { CollateralAmountPrice } from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

const getFarmAverageApy = (
    collateralInfos: CollateralInfos[],
    collateralAmountPrices: Record<string, CollateralAmountPrice>,
    reservesInfo: ReserveInfo[],
    coinPrices: Record<keyof Coins, number>
) => {
    const apys = collateralInfos.map((collateralInfo) => {
        const collateralPrice = collateralAmountPrices[collateralInfo.addressLP]
        const collateralValue = collateralPrice?.collateralValue;
        const collateralValueDecimal = bigIntToDecimal(collateralValue, collateralInfo.decimals) || 0;

        const lpApr = 0.089;
        const lpApy = getPoolAPY(undefined, lpApr);

        const tokensUn = getTokensSymbol(collateralInfo);

        const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokensUn);

        const borrowBalances = getPairBorrowBalances(
            collateralAmountPrices[collateralInfo.addressLP]?.debts,
            pairReservesInfosUn.reserveInfoTokenA,
            pairReservesInfosUn.reserveInfoTokenB
        );

        const tokensUSDPrices = getPairPrice(coinPrices, reservesInfo, tokensUn);

        let loanAUSD = borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA ? borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA : 0;
        let loanBUSD = borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB ? borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB : 0;

        const priceLoan = loanAUSD + loanBUSD;

        const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
            getPairBorrowApy(reservesInfo, tokensUn);

        const borrowApy = getBorrowAPY(
            tokensUSDPrices,
            borrowPoolAPYA,
            borrowPoolAPYB,
            borrowBalances?.borrowBalanceA,
            borrowBalances?.borrowBalanceB,
        );

        return getTotalApy(collateralValueDecimal, lpApy, priceLoan, borrowApy);
    }).filter((apy) => (apy ?? 0) > 0) as number[];

    const averageApy = apys.reduce((acc, apy) => acc + apy, 0) / apys.length;

    return averageApy;
}
export default getFarmAverageApy;