import { useEffect, useState } from "react";
import { useLendingPool } from "./wagmiSH/viewFunctions/useLendingPool";
import { ReserveInfo } from "../types/save.types";
import getUserDToken from "./getUserDToken";
import { BalanceLDToken } from "../types/global.types";
import { Address } from "viem";

const useGetUserReservesInfo = (reserveInfos: ReserveInfo[], balanceLDToken: Record<Address, BalanceLDToken>) => {
  return reserveInfos.filter((reserveInfo) => {
    const userDToken = getUserDToken(reserveInfo, balanceLDToken[reserveInfo.address]);
    return userDToken.userDTokenAmount;
  });
};
export default useGetUserReservesInfo;
