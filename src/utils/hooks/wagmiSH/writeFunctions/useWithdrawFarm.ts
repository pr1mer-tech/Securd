import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos } from "@/utils/types/farm.types";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useWithdrawFarm = (
  collateralInfos: CollateralInfos | undefined,
  amount_: bigint | undefined,
  withdraw: boolean
) => {
  const { isConnected, address } = useAccount();

  const { config } = usePrepareContractWrite({
    ...collateralPoolContract,
    functionName: "withdraw",
    args: [collateralInfos?.addressLP, amount_, address],
    enabled:
      collateralInfos !== undefined &&
      withdraw &&
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

  useStepsToaster("COLLATERAL RELEASE", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
  };
};

export default useWithdrawFarm;
