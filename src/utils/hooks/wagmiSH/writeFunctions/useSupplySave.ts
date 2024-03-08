import { MainContext } from "@/context/Main.context";
import { lendingPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { useContext } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import useStepsToaster from "../../useStepsToaster";

const useSupplySave = (
  asset_: string | undefined,
  amount_: bigint | undefined,
  deposit: boolean,
  isEther: boolean
) => {
  const { userAddress, isConnected } = useContext(MainContext);
  const { config } = usePrepareContractWrite({
    ...lendingPoolContract,
    functionName: "supply",
    args: [asset_, amount_, userAddress],
    value: isEther ? amount_ : BigInt(0),
    enabled:
      amount_ !== BigInt(0) &&
      deposit &&
      isConnected &&
      asset_ !== undefined &&
      amount_ != undefined,
  });

  const {
    data,
    write,
    isError: isErrorWriteSave,
  } = useContractWrite({
    ...config,
  });

  const { isSuccess, isLoading, isError } = useWaitForTransaction({
    hash: data?.hash,
  });

  useStepsToaster("DEPOSIT", isSuccess, isLoading, isError);

  return {
    isSuccess,
    isLoading,
    isError,
    write,
    isErrorWriteSave,
  };
};

export default useSupplySave;
