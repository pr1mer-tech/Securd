import {
  AddressZero,
  decimalDAI,
  decimalETH,
  decimalUSDC,
  decimalUSDT,
  decimalWBTC,
} from "@/utils/constants/constants";
import { lendingPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { ReserveInfo } from "@/utils/types/save.types";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

export const useLendingPool = () => {
  const [reservesInfo, setReservesInfo] = useState<ReserveInfo[]>([]);
  const { isConnected } = useAccount();

  useContractReads({
    contracts: [
      {
        ...lendingPoolContract,
        functionName: "reserveInfos",
        args: [AddressZero as Address],
      },
      {
        ...lendingPoolContract,
        functionName: "reserveInfos",
        args: [process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address],
      },
      {
        ...lendingPoolContract,
        functionName: "reserveInfos",
        args: [process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as Address],
      },
      {
        ...lendingPoolContract,
        functionName: "reserveInfos",
        args: [process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS as Address],
      },
      {
        ...lendingPoolContract,
        functionName: "reserveInfos",
        args: [process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS as Address],
      },
    ],
    onSuccess(data) {
      if (
        data[0].result &&
        data[1].result &&
        data[2].result &&
        data[3].result &&
        data[4].result
      ) {
        setReservesInfo([
          {
            symbol: "ETH",
            imgSrc:
              "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
            address: AddressZero as Address,
            decimals: decimalETH,
            supplyCap: data[0].result[0],
            supply: data[0].result[1],
            debt: data[0].result[2],
            fee: data[0].result[3],
            lastBlock: data[0].result[4],
            lastTime: data[0].result[5],
            isActivated: data[0].result[6],
            interestRateInfo: data[0].result[7],
            tokenInfo: data[0].result[8],
          } as any,
          {
            symbol: "USDC",
            decimals: decimalUSDC,
            imgSrc:
              "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389",
            address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address,
            supplyCap: data[1].result[0],
            supply: data[1].result[1],
            debt: data[1].result[2],
            fee: data[1].result[3],
            lastBlock: data[1].result[4],
            lastTime: data[1].result[5],
            isActivated: data[1].result[6],
            interestRateInfo: data[1].result[7],
            tokenInfo: data[1].result[8],
          },
          {
            symbol: "USDT",
            imgSrc:
              "https://assets.coingecko.com/coins/images/325/large/Tether.png?1668148663",
            decimals: decimalUSDT,
            address: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as Address,
            supplyCap: data[2].result[0],
            supply: data[2].result[1],
            debt: data[2].result[2],
            fee: data[2].result[3],
            lastBlock: data[2].result[4],
            lastTime: data[2].result[5],
            isActivated: data[2].result[6],
            interestRateInfo: data[2].result[7],
            tokenInfo: data[2].result[8],
          },
          {
            symbol: "DAI",
            imgSrc:
              "https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png?1687143508",
            decimals: decimalDAI,
            address: process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS as Address,
            supplyCap: data[3].result[0],
            supply: data[3].result[1],
            debt: data[3].result[2],
            fee: data[3].result[3],
            lastBlock: data[3].result[4],
            lastTime: data[3].result[5],
            isActivated: data[3].result[6],
            interestRateInfo: data[3].result[7],
            tokenInfo: data[3].result[8],
          },
          {
            symbol: "WBTC",
            imgSrc:
              "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
            decimals: decimalWBTC,
            address: process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS as Address,
            supplyCap: data[4].result[0],
            supply: data[4].result[1],
            debt: data[4].result[2],
            fee: data[4].result[3],
            lastBlock: data[4].result[4],
            lastTime: data[4].result[5],
            isActivated: data[4].result[6],
            interestRateInfo: data[4].result[7],
            tokenInfo: data[4].result[8],
          },
        ]);
      }
    },
    enabled: isConnected,
    watch: true,
  }) as any;

  return {
    reservesInfo,
  };
};
