"use client";
import { useReadContracts } from "wagmi";
import { assetPriceOracleContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { weiToEth } from "@/lib/helpers/main.helpers";
import type { Coins, ReserveInfo } from "@/lib/types/save.types";

const useAssetPriceOracle: (
  reservesInfo: ReserveInfo[],
) => Record<keyof Coins, number> = (reservesInfo) => {
  const { data } = useReadContracts({
    contracts: reservesInfo.map((reserve) => ({
      ...assetPriceOracleContract,
      functionName: "getAssetPrice",
      args: [reserve.address],
    })),
    query: {
      // enabled: isConnected,
      // refetchInterval: 10000,
    },
  });

  if (!data)
    return Object.fromEntries(
      reservesInfo.map((reserve) => [reserve.symbol as keyof Coins, 1]),
    ) as Record<keyof Coins, number>;

  const coinPrices = reservesInfo.reduce(
    (acc, reserve, index) => {
      const result = data[index]?.result;
      if (typeof result !== "string" && typeof result !== "bigint") {
        acc[reserve.symbol as keyof Coins] = 1;
        return acc;
      }
      const price = weiToEth(BigInt(result as string | bigint));
      acc[reserve.symbol as keyof Coins] = price;
      return acc;
    },
    {} as Record<keyof Coins, number>,
  );

  return coinPrices;
};
export default useAssetPriceOracle;
