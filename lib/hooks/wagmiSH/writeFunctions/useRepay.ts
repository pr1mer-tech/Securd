import { MainContext } from "@/context/Main.context";
import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos } from "@/utils/types/farm.types";
import { useContext } from "react";
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useRepay = (
  collateralInfos: CollateralInfos | undefined,
  asset_: Address | undefined,
  amount_: bigint | undefined,
  repay: boolean
) => {
  const { userAddress, isConnected } = useContext(MainContext);

  const { config } = usePrepareContractWrite({
    ...collateralPoolContract,
    functionName: "repay",
    args: [collateralInfos?.addressLP, asset_, amount_, userAddress],
    enabled:
      asset_ !== undefined &&
      collateralInfos !== undefined &&
      repay &&
      isConnected &&
      amount_ !== BigInt(0) &&
      amount_ !== undefined,
  });

  const { data, write } = useContractWrite({
    ...config,
  });

  const { isSuccess, isLoading, isError } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster("REPAY", isSuccess, isLoading, isError);
  return {
    isSuccess,
    isLoading,
    isError,
    write,
  };
};

export default useRepay;
