import { Coins, ReserveInfo } from "../types/save.types";
import getUserDepositBalance from "./getUserDepositBalance";
import { useContext, useEffect, useState } from "react";
import { getSavingApy } from "../helpers/lenderPool.helpers";
import { Address } from "viem";
import { BalanceLDToken } from "../types/global.types";

const getTotalAverageApy = (reservesInfo: ReserveInfo[], balanceLDTokens: Record<Address, BalanceLDToken>, coinPrices: Record<keyof Coins, number>) => {
  let numerator = 0;
  let denominator = 0;

  const results = reservesInfo.reduce((acc, reserve) => {
    const { userDepositBalance } = getUserDepositBalance(reserve, balanceLDTokens[reserve.address]);
    if (userDepositBalance) {
      const apy = getSavingApy(reserve) || 0;
      const price = coinPrices[reserve.symbol as keyof Coins] || 0;
      acc.numerator += userDepositBalance * price * apy;
      acc.denominator += userDepositBalance * price;
    }
    return acc;
  }, { numerator: 0, denominator: 0 });

  numerator = results.numerator;
  denominator = results.denominator;

  return denominator !== 0 ? numerator / denominator : 0;
};

export default getTotalAverageApy;
