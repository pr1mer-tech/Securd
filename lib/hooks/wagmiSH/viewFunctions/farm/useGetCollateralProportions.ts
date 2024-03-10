import { collateralPriceContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { Proportions } from "@/utils/types/farm.types";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

const useGetCollateralProportions = (
  assetLP: Address | undefined,
  amount_: bigint | undefined
) => {
  const [amounts, setAmounts] = useState<Proportions>();

  const { isConnected } = useAccount();

  useContractReads({
    contracts: [
      {
        ...collateralPriceContract,
        functionName: "getCollateralAmount",
        args: [assetLP as Address, amount_ as bigint],
      },
    ],
    onSuccess(data: any) {
      if (data[0].result) {
        setAmounts({
          tokenA: data[0].result[0],
          tokenB: data[0].result[1],
        });
      }
    },
    enabled: isConnected && assetLP !== undefined && amount_ !== undefined,
    watch: true,
  }) as any;

  return { amounts };
};
export default useGetCollateralProportions;
