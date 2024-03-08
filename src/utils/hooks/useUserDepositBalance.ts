import { useEffect, useMemo, useState } from "react";
import { ReserveInfo } from "../types/save.types";
import { getDtokenprice } from "../helpers/lenderPool.helpers";
import useGetUserDToken from "./useGetUserDToken";

const useUserDepositBalance = (reserveInfo: ReserveInfo | undefined) => {
  const [userDepositBalance, setUserDepositBalance] = useState<number>(0);
  const dTokenPrice = useMemo(() => {
    if (reserveInfo !== undefined) {
      return getDtokenprice(reserveInfo);
    }
  }, [reserveInfo]);

  const { userDTokenAmount } = useGetUserDToken(reserveInfo);

  useEffect(() => {
    const userDepositBalance =
      userDTokenAmount !== undefined && dTokenPrice !== undefined
        ? userDTokenAmount * dTokenPrice
        : undefined;
    if (userDepositBalance !== undefined) {
      setUserDepositBalance(userDepositBalance);
    }
  }, [userDTokenAmount, dTokenPrice, reserveInfo]);

  return { userDepositBalance };
};

export default useUserDepositBalance;
