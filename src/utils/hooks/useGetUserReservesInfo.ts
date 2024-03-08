import { useEffect, useState } from "react";
import { useLendingPool } from "./wagmiSH/viewFunctions/useLendingPool";
import { ReserveInfo } from "../types/save.types";
import useGetUserDToken from "./useGetUserDToken";

const useGetUserReservesInfo = () => {
  const { reservesInfo } = useLendingPool();
  const [userReservesInfo, setUserReservesInfo] = useState<ReserveInfo[]>([]);
  const { userDTokenAmount: userDTokenAmountETH } = useGetUserDToken(
    reservesInfo[0]
  );
  const { userDTokenAmount: userDTokenAmountUSDC } = useGetUserDToken(
    reservesInfo[1]
  );
  const { userDTokenAmount: userDTokenAmountUSDT } = useGetUserDToken(
    reservesInfo[2]
  );
  const { userDTokenAmount: userDTokenAmountDAI } = useGetUserDToken(
    reservesInfo[3]
  );

  useEffect(() => {
    let userReservesInfo: ReserveInfo[] = [];
    if (userDTokenAmountETH) {
      userReservesInfo.push(reservesInfo[0]);
    }

    if (userDTokenAmountUSDC) {
      userReservesInfo.push(reservesInfo[1]);
    }

    if (userDTokenAmountUSDT) {
      userReservesInfo.push(reservesInfo[2]);
    }

    if (userDTokenAmountDAI) {
      userReservesInfo.push(reservesInfo[3]);
    }
    setUserReservesInfo(userReservesInfo);
  }, [reservesInfo]);

  return { userReservesInfo };
};
export default useGetUserReservesInfo;
