import { Coins, ReserveInfo } from "../types/save.types";
import getUserDepositBalance from "./getUserDepositBalance";
import { getSavingApy } from "../helpers/lenderPool.helpers";
import { Address } from "viem";
import { BalanceLDToken } from "../types/global.types";
import { bigIntToDecimal } from "../helpers/main.helpers";

const getTotalAverageApy = (reservesInfo: ReserveInfo[], balanceLDTokens: Record<Address, BalanceLDToken>, coinPrices: Record<keyof Coins, number>) => {
  let numerator = 0;
  let denominator = 0;

  const results = reservesInfo.reduce((acc, reserve) => {
    const userDepositBalance = getUserDepositBalance(reserve, balanceLDTokens[reserve.address]);
    if (userDepositBalance) {
      const apy = getSavingApy(reserve) || 0;
      const price = coinPrices[reserve.symbol as keyof Coins] || 0;
      const decimals = (bigIntToDecimal(userDepositBalance, reserve.decimals) ?? 0)
      acc.numerator += decimals * price * apy;
      acc.denominator += decimals * price;
    }
    return acc;
  }, { numerator: 0, denominator: 0 });

  numerator = results.numerator;
  denominator = results.denominator;

  return denominator !== 0 ? numerator / denominator : 0;
};

export default getTotalAverageApy;
