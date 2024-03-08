import { abiUSDT } from "@/utils/constants/abi/abi";
import {
  Address,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useApproveFarm = (
  depositAmount: bigint | undefined,
  asset: Address | undefined,
  deposit: boolean
) => {
  const { config: configApprove } = usePrepareContractWrite({
    address: asset as `0x${string}`,
    abi: abiUSDT,
    functionName: "approve",
    args: [
      process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS,
      depositAmount,
    ],
    enabled:
      depositAmount !== BigInt(0) &&
      deposit &&
      asset !== undefined &&
      depositAmount !== undefined,
    onError(error) {
      throw new Error("Approve Error: " + error);
    },
  });

  const {
    data,
    write: writeApprove,
    isError: isErrorWriteApprove,
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

  return { approveSuccess, writeApprove, isErrorWriteApprove, isErrorApprove };
};
export default useApproveFarm;
