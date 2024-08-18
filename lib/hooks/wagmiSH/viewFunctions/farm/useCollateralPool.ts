import type { Analytics, Dex, Pool, Token } from "@/db/schema";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import type { CollateralInfos, PoolType } from "@/lib/types/farm.types";
import type { Address } from "viem";
import { useReadContracts } from "wagmi";

const useCollateralPool: (pools: (Pool & {
  token_0: Token | null,
  token_1: Token | null,
  dex: Dex | null,
  analytics: Analytics[] | null,
})[]) => CollateralInfos[] = (pools) => {

  const { data } = useReadContracts({
    contracts: pools.map((pool) => ({
      address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
      abi: abiCollateralPool,
      functionName: "collateralInfos",
      args: [pool.pool_address],
    })),
    query: {
      // enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.some((item) => !item.result) || data.length !== pools.length) {
    return [];
  }

  return data.map((item, index) => ({
    symbol: `${pools[index].token_0?.token_symbol}/${pools[index].token_1?.token_symbol}`,
    token_0: pools[index].token_0?.token_address as Address,
    token_1: pools[index].token_1?.token_address as Address,
    poolType: pools[index].dex?.dex_type as PoolType,
    decimals: pools[index].decimals,
    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
    addressLP: pools[index].pool_address as Address,
    //@ts-expect-error CollateralInfos is not properly casting
    tokenInfo: item.result[0],
    //@ts-expect-error CollateralInfos is not properly casting
    liquidationThresholdInfo: item.result[1],
    //@ts-expect-error CollateralInfos is not properly casting
    liquidationPremium: item.result[2],
    //@ts-expect-error CollateralInfos is not properly casting
    isActivated: item.result[3],
    lpApr: pools[index].analytics?.[0]?.fee_apy_3m ?? 0,
  }));
};
export default useCollateralPool;
