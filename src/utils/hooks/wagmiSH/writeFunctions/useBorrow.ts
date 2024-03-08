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

const useBorrow = (
  collateralInfos: CollateralInfos | undefined,
  asset_: Address | undefined,
  amount_: bigint | undefined,
  borrow: boolean
) => {
  const { userAddress, isConnected } = useContext(MainContext);

  const { config } = usePrepareContractWrite({
    ...collateralPoolContract,
    functionName: "borrow",
    args: [collateralInfos?.addressLP, asset_, amount_, userAddress],
    enabled:
      asset_ !== undefined &&
      collateralInfos !== undefined &&
      borrow &&
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

  useStepsToaster("BORROW", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
  };
};

export default useBorrow;
