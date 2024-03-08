import { MainContext } from "@/context/Main.context";
import { useContext, useEffect, useState } from "react";
import { Coins, ReserveInfo } from "../types/save.types";
import useUserDepositBalance from "./useUserDepositBalance";

const useGetUserTotalBalanceUSD = (reservesInfo: ReserveInfo[]) => {
  const { coinPrices } = useContext(MainContext);
  const [totalUserBalance, setTotalUserBalance] = useState<number>(0);

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
    reservesInfo && reservesInfo[4]
  );

  useEffect(() => {
    let totalUserBalance: number = 0;
    if (userDepositBalanceETH) {
      totalUserBalance +=
        userDepositBalanceETH *
        coinPrices[reservesInfo[0].symbol as keyof Coins];
    }
    if (userDepositBalanceUSDC) {
      totalUserBalance +=
        userDepositBalanceUSDC *
        coinPrices[reservesInfo[1].symbol as keyof Coins];
    }
    if (userDepositBalanceUSDT) {
      totalUserBalance +=
        userDepositBalanceUSDT *
        coinPrices[reservesInfo[2].symbol as keyof Coins];
    }
    if (userDepositBalanceDAI) {
      totalUserBalance +=
        userDepositBalanceDAI *
        coinPrices[reservesInfo[3].symbol as keyof Coins];
    }
    if (userDepositBalanceWBTC) {
      totalUserBalance +=
        userDepositBalanceWBTC *
        coinPrices[reservesInfo[4].symbol as keyof Coins];
    }
    setTotalUserBalance(totalUserBalance);
  }, [reservesInfo, coinPrices]);

  return {
    totalUserBalance,
  };
};

export default useGetUserTotalBalanceUSD;
