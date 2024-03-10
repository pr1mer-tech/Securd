import { useContext, useEffect, useState } from "react";
import { Coins, ReserveInfo } from "../types/save.types";
import useGetLenderSupply from "./wagmiSH/viewFunctions/useGetLenderSupply";
import { Address } from "viem";

const getTotalDeposit = (reserveInfo: ReserveInfo[], userDeposit: Record<Address, number>, coinPrices: Record<keyof Coins, number>) => {
  return reserveInfo.reduce((acc, reserve) => {
    const price = coinPrices[reserve.symbol as keyof Coins] || 0;
    return acc + (userDeposit[reserve.address] || 0) * price;
  }, 0);
};

export default getTotalDeposit;
