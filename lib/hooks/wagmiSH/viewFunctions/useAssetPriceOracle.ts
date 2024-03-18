"use client";
import { useAccount, useReadContracts } from "wagmi";
import { assetPriceOracleContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { weiToEth } from "@/lib/helpers/main.helpers";
import { AddressZero } from "@/lib/constants/constants";
import { Coins, ReserveInfo } from "@/lib/types/save.types";

const useAssetPriceOracle: (reservesInfo: ReserveInfo[]) => Record<keyof Coins, number> = (reservesInfo) => {
  const { isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: reservesInfo.map((reserve) => ({
      ...assetPriceOracleContract,
      functionName: "getAssetPrice",
      args: [reserve.address],
    })) as any,
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    }
  })

  if (!data) return {} as Record<keyof Coins, number>;

  const coinPrices = reservesInfo.reduce((acc, reserve, index) => {
    if (typeof data[index].result != "string" && typeof data[index].result != "bigint") return acc;
    const price = weiToEth(BigInt(data[index].result as string | bigint));
    acc[reserve.symbol as keyof Coins] = price;
    return acc;
  }, {} as Record<keyof Coins, number>);

  return coinPrices;
};
export default useAssetPriceOracle;
