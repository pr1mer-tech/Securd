import { PositionData, PositionDataParams } from "@/utils/types/farm.types";
import { useContext, useState } from "react";
import { useContractRead } from "wagmi";
import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { MainContext } from "@/context/Main.context";
import { AddressZero } from "@/utils/constants/constants";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";

const useGetPositionData = (params: PositionDataParams) => {
  const { isConnected, userAddress } = useContext(MainContext);
  const [positionData, setPositionData] = useState<PositionData>();

  useContractRead({
    ...collateralPoolContract,
    functionName: "getPositionData",
    args: [
      {
        token: params.tokenAddress || AddressZero,
        borrower: userAddress || AddressZero,
        amount: params.collateralAmount || BigInt(0),
        amount0: BigInt(params.loanA || 0),
        amount1: BigInt(params.loanB || 0),
        direction: params.directionCollateral,
        direction0: params.directionLoanA,
        direction1: params.directionLoanB,
      },
    ],
    onSuccess(data: any) {
      const positionData: PositionData = {
        collateral: bigIntToDecimal(data.collateral, 18) || 0,
        collateralValue: bigIntToDecimal(data.collateralValue, 18) || 0,
        debt0: bigIntToDecimal(data.debt0, 18) || 0,
        debtValue0: bigIntToDecimal(data.debtValue0, 18) || 0,
        debt1: bigIntToDecimal(data.debt1, 18) || 0,
        debtValue1: bigIntToDecimal(data.debtValue1, 18) || 0,
        collateralFactor: bigIntToDecimal(data.collateralFactor, 16) || 0,
        leverageFactor: bigIntToDecimal(data.leverageFactor, 18) || 0,
        liquidationThreshold: bigIntToDecimal(data.liquidationFactor, 16) || 0,
      };

      setPositionData(positionData);
    },
    onError(error: Error) {
      throw new Error(error.message);
    },
    enabled: isConnected,
    watch: true,
  });

  return {
    positionData,
  };
};

export default useGetPositionData;
