import { useEffect, useState } from "react";
import { CollateralInfos } from "../types/farm.types";
import useCollateralAmountPrice from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

import { bigIntToDecimal } from "../helpers/main.helpers";

const useGetFarmTotalBalance = (collateralsInfos: CollateralInfos[]) => {
  const [totalUserFarmBalance, setTotalUserFarmBalance] = useState<number>(0);

  const { collateralValue: collateralValueOne } = useCollateralAmountPrice(
    collateralsInfos[0]?.addressLP
  );
  const { collateralValue: collateralValueTwo } = useCollateralAmountPrice(
    collateralsInfos[1]?.addressLP
  );
  const { collateralValue: collateralValueThree } = useCollateralAmountPrice(
    collateralsInfos[2]?.addressLP
  );
  const { collateralValue: collateralValueFour } = useCollateralAmountPrice(
    collateralsInfos[3]?.addressLP
  );

  useEffect(() => {
    let totalUserBalance: number = 0;
    if (collateralValueOne) {
      totalUserBalance += bigIntToDecimal(collateralValueOne, 18) || 0;
    }
    if (collateralValueTwo) {
      totalUserBalance += bigIntToDecimal(collateralValueTwo, 18) || 0;
    }
    if (collateralValueThree) {
      totalUserBalance += bigIntToDecimal(collateralValueThree, 18) || 0;
    }
    if (collateralValueFour) {
      totalUserBalance += bigIntToDecimal(collateralValueFour, 18) || 0;
    }
    setTotalUserFarmBalance(totalUserBalance);
  }, [collateralsInfos]);

  return {
    totalUserFarmBalance,
  };
};

export default useGetFarmTotalBalance;
