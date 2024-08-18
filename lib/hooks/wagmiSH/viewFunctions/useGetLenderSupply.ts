import { lendingPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import type { ReserveInfo } from "@/lib/types/save.types";
import type { Address } from "viem";
import { useReadContracts } from "wagmi";
import { useAccount } from "@/lib/hooks/bear/account";

const useGetLenderSupply: (reserveInfos: ReserveInfo[]) => Record<Address, bigint> = (reserveInfos) => {
  const { isConnected, address } = useAccount();

  const { data, error } = useReadContracts({
    contracts: reserveInfos.map((reserve) => ({
      ...lendingPoolContract,
      functionName: "getLenderSupply",
      args: [reserve.address, address as string],
    })),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data) {
    return {};
  }

  return Object.fromEntries(data.map((item, i) => ([reserveInfos[i].address, BigInt(item.result as string)])))
};

export default useGetLenderSupply;
