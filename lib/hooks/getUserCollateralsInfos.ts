import { CollateralInfos } from "../types/farm.types";
import { CollateralAmountPrice } from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";

const getUserCollateralsInfos = (collateralsInfos: CollateralInfos[], collateralAmountPrices: Record<string, CollateralAmountPrice>) => {
  return collateralsInfos.filter((collateralInfo) => {
    return collateralAmountPrices[collateralInfo.addressLP]?.collateralValue;
  });
};

export default getUserCollateralsInfos;
