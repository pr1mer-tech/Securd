import { abiCollateralPool } from "@/utils/constants/abi/abiCollateralPool";
import { CollateralInfos } from "@/utils/types/farm.types";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

const useCollateralPool = () => {
  const [collateralsInfos, setCollateralsInfos] = useState<CollateralInfos[]>(
    []
  );

  const { isConnected } = useAccount();

  useContractReads({
    contracts: [
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool as any,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPUSDC_USDT_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool as any,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPDAI_USDC_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool as any,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPUSDC_ETH_CONTRACT_ADDRESS as Address],
      },
      {
        address: process.env
          .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
        abi: abiCollateralPool as any,
        functionName: "collateralInfos",
        args: [process.env.NEXT_PUBLIC_LPWBTC_ETH_CONTRACT_ADDRESS as Address],
      },
    ],
    onSuccess(data: any) {
      if (
        data[0].result &&
        data[1].result &&
        data[2].result &&
        data[3].result
      ) {
        setCollateralsInfos([
          {
            symbol: "USDT/USDC",
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
            address: process.env
              .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as Address,
            addressLP: process.env
              .NEXT_PUBLIC_LPWBTC_ETH_CONTRACT_ADDRESS as Address,
            tokenInfo: data[3].result[0],
            liquidationThresholdInfo: data[3].result[1],
            liquidationPremium: data[3].result[2],
            isActivated: data[3].result[3],
          },
        ]);
      }
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.log("Error", error);
    },
    enabled: isConnected,
    watch: true,
  }) as any;

  return { collateralsInfos };
};
export default useCollateralPool;
