import type { ReserveInfo } from "../types/save.types";

const getUserDToken = (
  _reserveInfo: ReserveInfo | undefined,
  balanceLDToken:
    | {
        dToken: bigint;
        lToken: bigint;
      }
    | undefined,
) => {
  const userDTokenAmount = balanceLDToken?.dToken ?? 0n;
  return { userDTokenAmount };
};

export default getUserDToken;
