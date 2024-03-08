import { lendingPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useWithdrawSave = (
  asset_: string | undefined,
  amount_: bigint | undefined,
  withdraw: boolean
) => {
  const { isConnected, address } = useAccount();

  const { config } = usePrepareContractWrite({
    ...lendingPoolContract,
    functionName: "withdraw",
    args: [asset_, amount_, address],
    enabled:
      withdraw && isConnected && asset_ !== undefined && amount_ !== undefined,
  });

  const {
    data,
    write,
    isError: isErrorWriteWithdraw,
  } = useContractWrite({
    ...config,
  });

  const { isSuccess, isLoading, isError } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster("WITHDRAW", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
    isErrorWriteWithdraw,
  };
};

export default useWithdrawSave;
