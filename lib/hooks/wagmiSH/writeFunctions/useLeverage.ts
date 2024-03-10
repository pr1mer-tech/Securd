import { MainContext } from "@/context/Main.context";
import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos } from "@/utils/types/farm.types";
import { useContext } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useLeverage = (
  collateralInfos: CollateralInfos | undefined,
  amount_: bigint | undefined,
  leverage: boolean
) => {
  const { isConnected } = useContext(MainContext);
  const { config } = usePrepareContractWrite({
    ...collateralPoolContract,
    functionName: "leverage",
    args: [collateralInfos?.addressLP, amount_],
    enabled:
      collateralInfos !== undefined &&
      amount_ !== undefined &&
      amount_ !== BigInt(0) &&
      leverage &&
      isConnected,
  });

  const { data, write } = useContractWrite({
    ...config,
  });

  const { isSuccess, isLoading, isError } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster("LEVERAGE", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
  };
};

export default useLeverage;
