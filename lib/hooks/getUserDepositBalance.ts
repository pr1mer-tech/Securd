import { useEffect, useMemo, useState } from "react";
import type { ReserveInfo } from "../types/save.types";
import { getDtokenprice } from "../helpers/lenderPool.helpers";
import getUserDToken from "./getUserDToken";

const getUserDepositBalance = (reserveInfo: ReserveInfo | undefined, balanceLDToken: {
  dToken: bigint;
  lToken: bigint;
}) => {
  if (reserveInfo === undefined) {
    return undefined;
  }
  const dTokenPrice = getDtokenprice(reserveInfo)

  const { userDTokenAmount } = getUserDToken(reserveInfo, balanceLDToken);

  const userDepositBalance =
    userDTokenAmount !== undefined && dTokenPrice !== undefined
      ? (userDTokenAmount * dTokenPrice) / (10n ** BigInt(reserveInfo.decimals))
      : 0n;

  return userDepositBalance;
};

export default getUserDepositBalance;
