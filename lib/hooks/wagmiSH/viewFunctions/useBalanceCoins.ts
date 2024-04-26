import { useAccount, useBalance, useReadContracts } from "wagmi";
import type { BalanceCoins } from "@/lib/types/save.types";
import { type Address, erc20Abi, zeroAddress } from "viem";

const useBalanceCoins = (reservesInfo: { address: Address }[]) => {
  const { isConnected, address } = useAccount();
  const balance = useBalance({
    address: address
  });

  const { data } = useReadContracts({
    contracts: reservesInfo
      .filter(info => info.address !== zeroAddress)
      .map((reserve) => ({
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

  if (!data && !balance.data) return {} as BalanceCoins;

  const coinPrices = reservesInfo.reduce((acc, reserve, index) => {
    if (reserve.address === zeroAddress && balance.data) {
      acc[reserve.address] = balance.data.value
      return acc;
    }
    if (!data?.[index].result) return acc;
    acc[reserve.address] = BigInt(data[index].result as string);
    return acc;
  }, {} as BalanceCoins);

  return coinPrices;
};
export default useBalanceCoins;
