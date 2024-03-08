import { useEffect, useState } from "react";
import { bigIntToDecimal } from "../helpers/main.helpers";
import { ReserveInfo } from "../types/save.types";
import useLDtoken from "./wagmiSH/viewFunctions/useLDtoken";

const useGetUserDToken = (reserveInfo: ReserveInfo | undefined) => {
  const [userDTokenAmount, setUserDTokenAmount] = useState<number>(0);
  const { balanceLDToken } = useLDtoken(
    reserveInfo?.tokenInfo.dToken,
    reserveInfo?.tokenInfo.lToken
  );

  useEffect(() => {
    const userDTokenAmount = bigIntToDecimal(balanceLDToken?.dToken, 18);
    if (userDTokenAmount !== undefined) {
      setUserDTokenAmount(userDTokenAmount);
    }
  }, [balanceLDToken]);

  return { userDTokenAmount };
};

export default useGetUserDToken;
