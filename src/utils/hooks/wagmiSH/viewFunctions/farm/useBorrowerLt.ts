import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useContractReads } from "wagmi";

const useBorrowerLt = (assetLp: Address | undefined) => {
  const [borrowerLT, setBorrowerLT] = useState<bigint>(BigInt(0));
  const { isConnected, address } = useAccount();

  useContractReads({
    contracts: [
      {
        ...collateralPoolContract,
        functionName: "isLiquidablePosition",
        args: [address as Address, assetLp as Address],
      },
    ],
    onSuccess(data: any) {
      if (data && data[0].result) setBorrowerLT(data[0].result[1]);
    },
    onError(error: Error) {
      throw new Error(error.message);
    },
    enabled: isConnected && assetLp !== undefined,
    watch: true,
  }) as any;

  return {
    borrowerLT,
  };
};
export default useBorrowerLt;
