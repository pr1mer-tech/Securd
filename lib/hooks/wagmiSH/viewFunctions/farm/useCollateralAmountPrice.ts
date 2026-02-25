import { collateralPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import type { CollateralInfos, Debts } from "@/lib/types/farm.types";
import type { Address } from "viem";
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
    contracts: collateralInfos.flatMap((info) => [
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
    ]),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.length < collateralInfos.length * 4) {
    return {};
  }

  const collateralAmountPrice = Object.fromEntries(
    collateralInfos
      .filter((info, index) => {
        const baseIndex = index * 4;
        const result = data[baseIndex]?.result;
        return (
          Array.isArray(result) && (result as unknown as any[]).length === 3
        );
      })
      .map((info, index) => {
        const baseIndex = index * 4;
        const result0 = data[baseIndex]?.result;
        const [collateralAmount, tokenA, tokenB] = Array.isArray(result0)
          ? (result0 as unknown as [bigint, bigint, bigint])
          : [0n, 0n, 0n];

        const collateralValue = data[baseIndex + 1]?.result;
        const collateralFactor = data[baseIndex + 2]?.result;
        const leverageFactor = data[baseIndex + 3]?.result;

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
      }),
  );

  return collateralAmountPrice as Record<Address, CollateralAmountPrice>;
};
export default useCollateralAmountPrice;
