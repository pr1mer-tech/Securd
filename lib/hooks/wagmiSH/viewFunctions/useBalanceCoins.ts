import { useAccount, useReadContracts } from "wagmi";
import { BalanceCoins } from "@/lib/types/save.types";
import { Address, erc20Abi } from "viem";

const useBalanceCoins = (reservesInfo: { address: Address }[]) => {
  const { isConnected, address } = useAccount();

  const { data } = useReadContracts({
    contracts: reservesInfo.map((reserve) => ({
      address: reserve.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    })),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    }
  })

  if (!data) return {} as BalanceCoins;

  const coinPrices = reservesInfo.reduce((acc, reserve, index) => {
    if (!data[index].result) return acc;
    acc[reserve.address] = BigInt(data[index].result as string);
    return acc;
  }, {} as BalanceCoins);

  return coinPrices;
};
export default useBalanceCoins;
