import { useEffect, useState } from "react";
import { CollateralInfos } from "../types/farm.types";
import useCollateralAmountPrice from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

const useGetUserCollateralsInfos = (collateralsInfos: CollateralInfos[]) => {
  const [userCollateralsInfos, setUserCollateralsInfos] = useState<
    CollateralInfos[]
  >([]);
  const { collateralAmount: collateralAmountOne } = useCollateralAmountPrice(
    collateralsInfos[0]?.addressLP
  );
  const { collateralAmount: collateralAmountTwo } = useCollateralAmountPrice(
    collateralsInfos[1]?.addressLP
  );
  const { collateralAmount: collateralAmountThree } = useCollateralAmountPrice(
    collateralsInfos[2]?.addressLP
  );
  const { collateralAmount: collateralAmountFour } = useCollateralAmountPrice(
    collateralsInfos[3]?.addressLP
  );

  useEffect(() => {
    let userCollateralsInfos: CollateralInfos[] = [];
    if (collateralAmountOne) {
      userCollateralsInfos.push(collateralsInfos[0]);
    }

    if (collateralAmountTwo) {
      userCollateralsInfos.push(collateralsInfos[1]);
    }

    if (collateralAmountThree) {
      userCollateralsInfos.push(collateralsInfos[2]);
    }

    if (collateralAmountFour) {
      userCollateralsInfos.push(collateralsInfos[3]);
    }
    setUserCollateralsInfos(userCollateralsInfos);
  }, [collateralsInfos]);

  return {
    userCollateralsInfos,
  };
};

export default useGetUserCollateralsInfos;
