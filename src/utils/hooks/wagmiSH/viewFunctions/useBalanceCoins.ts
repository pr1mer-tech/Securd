import { useState } from "react";
import { Address, useAccount, useBalance, useContractReads } from "wagmi";
import { abiUSDT } from "../../../constants/abi/abi";
import { BalanceCoins } from "@/utils/types/save.types";

const useBalanceCoins = () => {
  const [balanceCoins, setBalanceCoins] = useState<BalanceCoins>({
    ETH: BigInt(0),
    USDC: BigInt(0),
    USDT: BigInt(0),
    DAI: BigInt(0),
    WBTC: BigInt(0),
  });
  const { isConnected, address } = useAccount();

  useBalance({
    address: address,
    onSuccess(data) {
      setBalanceCoins((prev) => {
        return {
          ETH: data.value,
          USDC: prev.USDC,
          USDT: prev.USDT,
          DAI: prev.DAI,
          WBTC: prev.WBTC,
        };
      });
    },
  });

  useContractReads({
    contracts: [
      {
        address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as Address,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS as Address,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS as Address,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
    ],
    onSuccess(data: any) {
      setBalanceCoins((prev) => {
        return {
          ETH: prev.ETH,
          USDC: data[0].result,
          USDT: data[1].result,
          DAI: data[2].result,
          WBTC: data[3].result,
        };
      });
    },
    enabled: isConnected,
    watch: true,
  });
  return {
    balanceCoins,
  };
};
export default useBalanceCoins;
