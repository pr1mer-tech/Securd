import type { CollateralInfos } from "@/lib/types/farm.types";
import { collateralPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { useAccount, useReadContracts } from "wagmi";
import type { Address } from "viem";
import getUserCollateralsInfos from "@/lib/hooks/getUserCollateralsInfos";
import type { CollateralAmountPrice } from "./useCollateralAmountPrice";

const useBorrowerLt: (
  collateralInfos: CollateralInfos[],
  collateralAmountPrice: Record<Address, CollateralAmountPrice>,
) => Record<Address, bigint> = (collateralInfos, collateralAmountPrice) => {
  const { isConnected, address } = useAccount();

  const userCollateralInfos = getUserCollateralsInfos(
    collateralInfos,
    collateralAmountPrice,
  );

  const { data } = useReadContracts({
    contracts: userCollateralInfos.map((info) => ({
      ...collateralPoolContract,
      functionName: "isLiquidablePosition",
      args: [address, info.addressLP],
    })),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.length < userCollateralInfos.length) {
    return {};
  }

  return Object.fromEntries(
    userCollateralInfos.map((info, index) => {
      const result = data[index]?.result as unknown as [boolean, bigint];
      if (!Array.isArray(result) || result.length !== 2) {
        return [info.addressLP, 0n];
      }
      return [info.addressLP, result[1] as bigint];
    }),
  );
};
export default useBorrowerLt;
