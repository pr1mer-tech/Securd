import { MainContext } from "@/context/Main.context";
import { useContext, useEffect, useState } from "react";
import { Coins, ReserveInfo } from "../types/save.types";
import useGetLenderSupply from "./wagmiSH/viewFunctions/useGetLenderSupply";

const useGetTotalDeposit = (reservesInfo: ReserveInfo[]) => {
  const { coinPrices } = useContext(MainContext);
  const [totalUserDeposit, setTotalUserDeposit] = useState<number>(0);

  const { userDeposit: userDepositETH } = useGetLenderSupply(
    reservesInfo && reservesInfo[0]?.address
  );
  const { userDeposit: userDepositUSDC } = useGetLenderSupply(
    reservesInfo && reservesInfo[1]?.address
  );
  const { userDeposit: userDepositUSDT } = useGetLenderSupply(
    reservesInfo && reservesInfo[2]?.address
  );
  const { userDeposit: userDepositDAI } = useGetLenderSupply(
    reservesInfo && reservesInfo[3]?.address
  );
  const { userDeposit: userDepositWBTC } = useGetLenderSupply(
    reservesInfo && reservesInfo[4]?.address
  );

  useEffect(() => {
    let totalUserDeposit: number = 0;
    if (userDepositETH) {
      totalUserDeposit +=
        userDepositETH * coinPrices[reservesInfo[0].symbol as keyof Coins];
    }
    if (userDepositUSDC) {
      totalUserDeposit +=
        userDepositUSDC * coinPrices[reservesInfo[1].symbol as keyof Coins];
    }
    if (userDepositUSDT) {
      totalUserDeposit +=
        userDepositUSDT * coinPrices[reservesInfo[2].symbol as keyof Coins];
    }
    if (userDepositDAI) {
      totalUserDeposit +=
        userDepositDAI * coinPrices[reservesInfo[3].symbol as keyof Coins];
    }
    if (userDepositWBTC) {
      totalUserDeposit +=
        userDepositWBTC * coinPrices[reservesInfo[4].symbol as keyof Coins];
    }
    setTotalUserDeposit(totalUserDeposit);
  }, [reservesInfo, coinPrices]);

  return {
    totalUserDeposit,
  };
};

export default useGetTotalDeposit;
