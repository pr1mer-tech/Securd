import { useEffect, useMemo, useState } from "react";
import { ReserveInfo } from "../types/save.types";
import { getDtokenprice } from "../helpers/lenderPool.helpers";
import getUserDToken from "./getUserDToken";

const getUserDepositBalance = (reserveInfo: ReserveInfo | undefined, balanceLDToken: {
  dToken: bigint;
  lToken: bigint;
}) => {
  if (reserveInfo === undefined) {
    return { userDepositBalance: 0 };
  }
  const dTokenPrice = getDtokenprice(reserveInfo)

  const { userDTokenAmount } = getUserDToken(reserveInfo, balanceLDToken);

  const userDepositBalance =
    userDTokenAmount !== undefined && dTokenPrice !== undefined
      ? userDTokenAmount * dTokenPrice
      : 0;

  return { userDepositBalance };
};

export default getUserDepositBalance;
