import { MainContext } from "@/context/Main.context";
import { Coins, ReserveInfo } from "../types/save.types";
import useUserDepositBalance from "./useUserDepositBalance";
import { useContext, useEffect, useState } from "react";
import { getSavingApy } from "../helpers/lenderPool.helpers";

const useGetTotalAverageApy = (reservesInfo: ReserveInfo[]) => {
  const { coinPrices } = useContext(MainContext);
  const [numerator, setNumerator] = useState<number>(0);
  const [denominateur, setDenominator] = useState<number>(0);

  const { userDepositBalance: userDepositBalanceETH } = useUserDepositBalance(
    reservesInfo && reservesInfo[0]
  );
  const { userDepositBalance: userDepositBalanceUSDC } = useUserDepositBalance(
    reservesInfo && reservesInfo[1]
  );
  const { userDepositBalance: userDepositBalanceUSDT } = useUserDepositBalance(
    reservesInfo && reservesInfo[2]
  );
  const { userDepositBalance: userDepositBalanceDAI } = useUserDepositBalance(
    reservesInfo && reservesInfo[3]
  );
  const { userDepositBalance: userDepositBalanceWBTC } = useUserDepositBalance(
    reservesInfo && reservesInfo[3]
  );

  useEffect(() => {
    let numerator: number = 0;
    let denominator: number = 0;

    if (userDepositBalanceETH) {
      const apy = getSavingApy(reservesInfo[0]) || 0;
      const price = coinPrices[reservesInfo[0].symbol as keyof Coins] || 0;
      numerator += userDepositBalanceETH * price * apy;
      denominator += userDepositBalanceETH * price;
    }

    if (userDepositBalanceUSDC) {
      const apy = getSavingApy(reservesInfo[1]) || 0;
      const price = coinPrices[reservesInfo[1].symbol as keyof Coins] || 0;
      numerator += userDepositBalanceUSDC * price * apy;
      denominator += userDepositBalanceUSDC * price;
    }
    if (userDepositBalanceUSDT) {
      const apy = getSavingApy(reservesInfo[2]) || 0;
      const price = coinPrices[reservesInfo[2].symbol as keyof Coins] || 0;
      numerator += userDepositBalanceUSDT * price * apy;
      denominator += userDepositBalanceUSDT * price;
    }
    if (userDepositBalanceDAI) {
      const apy = getSavingApy(reservesInfo[3]) || 0;
      const price = coinPrices[reservesInfo[3].symbol as keyof Coins] || 0;
      numerator += userDepositBalanceDAI * price * apy;
      denominator += userDepositBalanceDAI * price;
    }
    if (userDepositBalanceWBTC) {
      const apy = getSavingApy(reservesInfo[4]) || 0;
      const price = coinPrices[reservesInfo[4].symbol as keyof Coins] || 0;
      numerator += userDepositBalanceWBTC * price * apy;
      denominator += userDepositBalanceWBTC * price;
    }
    setNumerator(numerator);
    setDenominator(denominator);
  }, [reservesInfo, coinPrices]);

  return denominateur !== 0 ? numerator / denominateur : 0;
};

export default useGetTotalAverageApy;
