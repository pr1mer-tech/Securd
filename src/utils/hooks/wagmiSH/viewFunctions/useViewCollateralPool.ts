import { MainContext } from "@/context/Main.context";
import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { useContext, useEffect, useState } from "react";
import { useContractReads } from "wagmi";

const useViewCollateralPool = (token_: string) => {
  const [collateralValue, setCollateralValue] = useState<number>(0);
  const [loanValue, setLoanValue] = useState<number>(0);
  const [collateralFactor, setCollateralFactor] = useState<number>(0);
  const [isLiquidablePosition, setIsLiquidablePosition] =
    useState<boolean>(false);

  const { userAddress, isConnected } = useContext(MainContext);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        ...collateralPoolContract,
        functionName: "getCollateralValue",
        args: [userAddress as `0x${string}`, token_],
      },
      {
        ...collateralPoolContract,
        functionName: "getLoanValue",
        args: [userAddress as `0x${string}`, token_],
      },
      {
        ...collateralPoolContract,
        functionName: "getCollateralFactor",
        args: [userAddress as `0x${string}`, token_],
      },
      {
        ...collateralPoolContract,
        functionName: "isLiquidablePosition",
        args: [userAddress as `0x${string}`, token_],
      },
    ],
    enabled: isConnected,
    watch: true,
  }) as any;

  useEffect(() => {
    if (!isLoading) {
      const collateralValue = data[0].result;
      const loanValue = data[1].result;
      const collateralFactor = data[2].result;
      const isLiquidablePosition = data[3].result;

      setCollateralValue(collateralValue);
      setLoanValue(loanValue);
      setCollateralFactor(collateralFactor);
      setIsLiquidablePosition(isLiquidablePosition);
    }
  }, [isLoading]);

  return {
    collateralValue,
    loanValue,
    collateralFactor,
    isLiquidablePosition,
  };
};

export default useViewCollateralPool;
