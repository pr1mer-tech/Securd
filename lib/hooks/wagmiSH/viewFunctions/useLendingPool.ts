// @ts-nocheck
import { lendingPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import type { ReserveInfo } from "@/lib/types/save.types";
import type { Address } from "viem";
import { useReadContracts } from "wagmi";

export const useLendingPool = (preReservesInfo: ReserveInfo[]) => {
  const { data } = useReadContracts({
    contracts: preReservesInfo.map((pool) => ({
      ...lendingPoolContract,
      functionName: "reserveInfos",
      args: [pool.address as Address],
    })),
    query: {
      // enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.some((item) => !Array.isArray(item.result)) || data.length !== preReservesInfo.length) {
    return {
      reservesInfo: [],
    };
  }

  const reservesInfo: ReserveInfo[] = preReservesInfo.map((reserveInfo, index) => ({
    ...reserveInfo,
    supplyCap: data[index].result[0],
    supply: data[index].result[1],
    debt: data[index].result[2],
    fee: data[index].result[3],
    lastBlock: data[index].result[4],
    lastTime: data[index].result[5],
    isActivated: data[index].result[6],
    interestRateInfo: data[index].result[7],
    tokenInfo: data[index].result[8],
  }));

  return {
    reservesInfo,
  };
};
