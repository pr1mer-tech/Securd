import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { CollateralInfos, PoolType } from "@/lib/types/farm.types";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

//@ts-expect-error CollateralInfos is not properly casting
const useCollateralPool: () => CollateralInfos[] = () => {
  const { isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPUSDC_USDT_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPDAI_USDC_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPUSDC_ETH_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPWBTC_ETH_CONTRACT_ADDRESS as Address],
      },
    ],
    query: {
      // enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.some((item) => !item.result) || data.length !== 4) {
    return [];
  }

  if (
    data[0].result &&
    data[1].result &&
    data[2].result &&
    data[3].result
  ) {
    return [
      {
        symbol: "USDT/USDC",
        poolType: PoolType.UniswapV2,
        decimals: 18,
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        addressLP: process.env
          .NEXT_PUBLIC_LPUSDC_USDT_CONTRACT_ADDRESS as Address,
        tokenInfo: data[0].result[0],
        liquidationThresholdInfo: data[0].result[1],
        liquidationPremium: data[0].result[2],
        isActivated: data[0].result[3],
      },
      {
        symbol: "DAI/USDC",
        poolType: PoolType.UniswapV2,
        decimals: 18,
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        addressLP: process.env
          .NEXT_PUBLIC_LPDAI_USDC_CONTRACT_ADDRESS as Address,
        tokenInfo: data[1].result[0],
        liquidationThresholdInfo: data[1].result[1],
        liquidationPremium: data[1].result[2],
        isActivated: data[1].result[3],
      },
      {
        symbol: "USDC/ETH",
        poolType: PoolType.UniswapV2,
        decimals: 18,
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        addressLP: process.env
          .NEXT_PUBLIC_LPUSDC_ETH_CONTRACT_ADDRESS as Address,
        tokenInfo: data[2].result[0],
        liquidationThresholdInfo: data[2].result[1],
        liquidationPremium: data[2].result[2],
        isActivated: data[2].result[3],
      },
      {
        symbol: "WBTC/ETH",
        poolType: PoolType.UniswapV2,
        decimals: 18,
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        addressLP: process.env
          .NEXT_PUBLIC_LPWBTC_ETH_CONTRACT_ADDRESS as Address,
        tokenInfo: data[3].result[0],
        liquidationThresholdInfo: data[3].result[1],
        liquidationPremium: data[3].result[2],
        isActivated: data[3].result[3],
      },
    ];
  }

  return []
};
export default useCollateralPool;
