import { Coins, ReserveInfo } from "../types/save.types";
import getUserDepositBalance from "./getUserDepositBalance";
import { BalanceLDToken } from "../types/global.types";
import { Address } from "viem";

const getUserTotalBalanceUSD = (reservesInfo: ReserveInfo[], coinPrices: Record<keyof Coins, number>, balanceLDToken: Record<Address, BalanceLDToken>) => {
  const totalUserBalance = reservesInfo.reduce((acc, reserve, index) => {
    const { userDepositBalance } = getUserDepositBalance(reserve, balanceLDToken[reserve.address]);
    if (userDepositBalance) {
      acc += userDepositBalance * coinPrices[reserve.symbol as keyof Coins];
    }
    return acc;
  }, 0);

  return {
    totalUserBalance,
  };
};

export default getUserTotalBalanceUSD;
