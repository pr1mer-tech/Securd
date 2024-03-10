import { lendingPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { ReserveInfo } from "@/lib/types/save.types";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useGetLenderSupply: (reserveInfos: ReserveInfo[]) => Record<Address, number> = (reserveInfos) => {
  const { isConnected, address } = useAccount();

  const { data } = useReadContracts({
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

  if (!data) return {};

  return Object.fromEntries(data.map((item, i) => ([reserveInfos[i].address, bigIntToDecimal(BigInt(item.result as string), reserveInfos[i].decimals) ?? 0])))
};

export default useGetLenderSupply;
