import { collateralPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos, Debts } from "@/lib/types/farm.types";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

export type CollateralAmountPrice = {
  collateralAmount?: bigint;
  collateralValue?: bigint;
  debts?: Debts;
  collateralFactor?: bigint;
  leverageFactor?: bigint;
};

const useCollateralAmountPrice = (collateralInfos: CollateralInfos[]) => {
  const { isConnected, address } = useAccount();

  const { data } = useReadContracts({
    contracts: collateralInfos.map(info => ([
      {
        ...collateralPoolContract,
        functionName: "borrowerBalances",
        args: [address, info.addressLP],
      },
      {
        ...collateralPoolContract,
        functionName: "getCollateralValue",
        args: [address, info.addressLP],
      },
      {
        ...collateralPoolContract,
        functionName: "getCollateralFactor",
        args: [address, info.addressLP],
      },
      {
        ...collateralPoolContract,
        functionName: "getLeverageFactor",
        args: [address, info.addressLP],
      },
    ])).flat(),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.length < collateralInfos.length * 4) {
    return {};
  }

  const collateralAmountPrice = Object.fromEntries(
    collateralInfos.map((info, index) => {
      const baseIndex = index * 4;
      const [collateralAmount, tokenA, tokenB] = data[baseIndex].result as unknown as [bigint, bigint, bigint];
      const collateralValue = data[baseIndex + 1].result;
      const collateralFactor = data[baseIndex + 2].result;
      const leverageFactor = data[baseIndex + 3].result;

      return [
        info.addressLP,
        {
          collateralAmount,
          collateralValue,
          debts: {
            tokenA,
            tokenB,
          },
          collateralFactor,
          leverageFactor,
        },
      ];
    })
  );

  return collateralAmountPrice as Record<Address, CollateralAmountPrice>;
};
export default useCollateralAmountPrice;