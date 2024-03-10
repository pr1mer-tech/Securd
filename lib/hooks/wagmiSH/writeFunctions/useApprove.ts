import { abiUSDT } from "@/utils/constants/abi/abi";
import { ReserveInfo } from "@/utils/types/save.types";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useApprove = (
  depositAmount: bigint | undefined,
  selectedReserveInfo: ReserveInfo | undefined,
  deposit: boolean,
  isEther: boolean
) => {
  const { config: configApprove } = usePrepareContractWrite({
    address: selectedReserveInfo?.address as `0x${string}`,
    abi: abiUSDT,
    functionName: "approve",
    args: [process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS, depositAmount],
    enabled:
      depositAmount !== BigInt(0) &&
      deposit &&
      !isEther &&
      selectedReserveInfo !== undefined &&
      depositAmount !== undefined,
    onError(error) {
      throw new Error("Approve Error: " + error);
    },
  });

  const {
    data,
    write: writeApprove,
    isError,
  } = useContractWrite(configApprove);

  const {
    isSuccess: approveSuccess,
    isLoading: isLoadingApprove,
    isSuccess: isSuccessApprove,
    isError: isErrorApprove,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster(
    "APPROVE",
    isSuccessApprove,
    isLoadingApprove,
    isErrorApprove
  );

  return {
    approveSuccess,
    writeApprove,
    isErrorApprove,
    isLoadingApprove,
    isError,
  };
};
export default useApprove;
