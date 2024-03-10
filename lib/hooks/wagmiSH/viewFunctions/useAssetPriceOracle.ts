"use client";
import { useAccount, useReadContracts } from "wagmi";
import { assetPriceOracleContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { weiToEth } from "@/lib/helpers/main.helpers";
import { AddressZero } from "@/lib/constants/constants";
import { Coins } from "@/lib/types/save.types";

const useAssetPriceOracle: () => Record<keyof Coins, number> = () => {
  const { isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        ...assetPriceOracleContract,
        functionName: "getAssetPrice",
        args: [AddressZero],
      },
      {
        ...assetPriceOracleContract,
        functionName: "getAssetPrice",
        args: [process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || ""],
      },
      {
        ...assetPriceOracleContract,
        functionName: "getAssetPrice",
        args: [process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || ""],
      },
      {
        ...assetPriceOracleContract,
        functionName: "getAssetPrice",
        args: [process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS || ""],
      },
      {
        ...assetPriceOracleContract,
        functionName: "getAssetPrice",
        args: [process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS || ""],
      },
    ],
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    }
  })

  if (!data) return {
    ETH: 0,
    USDC: 0,
    USDT: 0,
    DAI: 0,
    WBTC: 0,
  }

  const coinPrices = {
    ETH: weiToEth(Number(data[0].result)),
    USDC: weiToEth(Number(data[1].result)),
    USDT: weiToEth(Number(data[2].result)),
    DAI: weiToEth(Number(data[3].result)),
    WBTC: weiToEth(Number(data[4].result)),
  }
  return coinPrices;
};
export default useAssetPriceOracle;
