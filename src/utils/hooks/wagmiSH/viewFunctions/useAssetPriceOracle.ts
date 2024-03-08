"use client";
import { useState } from "react";
import { Coins } from "../../../types/save.types";
import { useAccount, useContractReads } from "wagmi";
import { assetPriceOracleContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { weiToEth } from "@/utils/helpers/main.helpers";
import { AddressZero } from "@/utils/constants/constants";

const useAssetPriceOracle = () => {
  const [coinPrices, setCoinPrices] = useState<Coins>({
    ETH: 0,
    USDC: 0,
    USDT: 0,
    DAI: 0,
    WBTC: 0,
  });
  const { isConnected } = useAccount();

  useContractReads({
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
    onSuccess(data) {
      setCoinPrices({
        ETH: weiToEth(Number(data[0].result)),
        USDC: weiToEth(Number(data[1].result)),
        USDT: weiToEth(Number(data[2].result)),
        DAI: weiToEth(Number(data[3].result)),
        WBTC: weiToEth(Number(data[4].result)),
      });
    },
    enabled: isConnected,
    watch: true,
  }) as any;

  return {
    coinPrices,
  };
};
export default useAssetPriceOracle;
