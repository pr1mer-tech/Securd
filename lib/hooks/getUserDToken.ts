import { useEffect, useState } from "react";
import { bigIntToDecimal } from "../helpers/main.helpers";
import { ReserveInfo } from "../types/save.types";
import getLDtoken from "./wagmiSH/viewFunctions/useLDtokens";

const getUserDToken = (reserveInfo: ReserveInfo | undefined, balanceLDToken: {
  dToken: bigint;
  lToken: bigint;
}) => {
  // const { balanceLDToken } = getLDtoken(
  //   reserveInfo?.tokenInfo.dToken,
  //   reserveInfo?.tokenInfo.lToken
  // );

  const userDTokenAmount = bigIntToDecimal(balanceLDToken?.dToken, 18);

  return { userDTokenAmount };
};

export default getUserDToken;
