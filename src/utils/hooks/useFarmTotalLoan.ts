import { useContext, useEffect, useMemo, useState } from "react";
import { CollateralInfos, PairReservesInfos } from "../types/farm.types";
import usePairBorrowBalances from "./usePairBorrowBalances";
import {
  getPairReservesInfos,
  getTokensSymbol,
} from "../helpers/borrow.helpers";
import { Coins, ReserveInfo } from "../types/save.types";
import { MainContext } from "@/context/Main.context";

const useFarmTotalLoan = (
  collateralInfos: CollateralInfos[],
  reservesInfo: ReserveInfo[]
) => {
  const { coinPrices } = useContext(MainContext);
  const tokensUn = useMemo(() => {
    return getTokensSymbol(collateralInfos[0]);
  }, [collateralInfos]);

  const pairReservesInfosUn: PairReservesInfos = useMemo(() => {
    return getPairReservesInfos(reservesInfo, tokensUn);
  }, [reservesInfo, tokensUn]);

  const { borrowBalances } = usePairBorrowBalances(
    collateralInfos[0]?.addressLP,
    pairReservesInfosUn.reserveInfoTokenA,
    pairReservesInfosUn.reserveInfoTokenB
  );

  const [farmTotalLoan, setFarmTotalLoan] = useState<number>(0);
  useEffect(() => {
    let farmTotalLoan: number = 0;
    if (borrowBalances) {
      const loanA = borrowBalances.borrowBalanceA || 0;
      const loanB = borrowBalances.borrowBalanceB || 0;
      farmTotalLoan +=
        loanA *
        coinPrices[
          pairReservesInfosUn.reserveInfoTokenA?.symbol as keyof Coins
        ];
      farmTotalLoan +=
        loanB *
        coinPrices[
          pairReservesInfosUn.reserveInfoTokenB?.symbol as keyof Coins
        ];
    }

    setFarmTotalLoan(farmTotalLoan);
  }, [borrowBalances, coinPrices]);

  return { farmTotalLoan };
};
export default useFarmTotalLoan;
