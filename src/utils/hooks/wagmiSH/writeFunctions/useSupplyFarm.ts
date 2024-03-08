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

const useSupplyFarm = (
  collateralInfos: CollateralInfos | undefined,
  amount_: bigint | undefined,
  deposit: boolean
) => {
  const { userAddress, isConnected } = useContext(MainContext);

  const enabled =
    deposit &&
    isConnected &&
    collateralInfos !== undefined &&
    amount_ !== BigInt(0) &&
    amount_ !== undefined;

  const { config } = usePrepareContractWrite({
    ...collateralPoolContract,
    functionName: "supply",
    args: [collateralInfos?.addressLP, amount_, userAddress],
    enabled: enabled,
    account: userAddress,
  });

  const { data, write } = useContractWrite({
    ...config,
  });

  const { isSuccess, isLoading, isError } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster("LOCK", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
  };
};

export default useSupplyFarm;
