import { CollateralInfos } from "../types/farm.types";
import {
  getPairReservesInfos,
  getTokensSymbol,
} from "../helpers/borrow.helpers";
import { Coins, ReserveInfo } from "../types/save.types";
import getPairBorrowBalances from "./getPairBorrowBalances";
import { CollateralAmountPrice } from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

const getFarmTotalLoan = (
  collateralInfos: CollateralInfos[],
  collateralAmountPrices: Record<string, CollateralAmountPrice>,
  reservesInfo: ReserveInfo[],
  coinPrices: Record<keyof Coins, number>
) => {
  return collateralInfos.reduce((totalLoan, collateralInfo) => {
    const tokensUn = getTokensSymbol(collateralInfo);

    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokensUn);

    const borrowBalances = getPairBorrowBalances(
      collateralAmountPrices[collateralInfo.addressLP]?.debts,
      pairReservesInfosUn.reserveInfoTokenA,
      pairReservesInfosUn.reserveInfoTokenB
    );

    if (borrowBalances) {
      const loanA = borrowBalances.borrowBalanceA || 0;
      const loanB = borrowBalances.borrowBalanceB || 0;
      totalLoan +=
        loanA *
        coinPrices[
        pairReservesInfosUn.reserveInfoTokenA?.symbol as keyof Coins
        ];
      totalLoan +=
        loanB *
        coinPrices[
        pairReservesInfosUn.reserveInfoTokenB?.symbol as keyof Coins
        ];
    }

    return totalLoan;
  }, 0);
};
export default getFarmTotalLoan;
