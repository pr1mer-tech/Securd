import type { CollateralInfos } from "@/lib/types/farm.types";
import { collateralPriceContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { useReadContracts } from "wagmi";
import type { CollateralAmountPrice } from "./useCollateralAmountPrice";
import type { Address } from "viem";

const useGetCollateralProportions = (collateralInfos: CollateralInfos[], collateralAmountPrice: Record<Address, CollateralAmountPrice>) => {

  const { data } = useReadContracts({
    contracts: collateralInfos.flatMap((info) => ([
      {
        ...collateralPriceContract,
        functionName: "getCollateralAmount",
        args: [info.addressLP, collateralAmountPrice[info.addressLP]?.collateralAmount],
      },
      {
        ...collateralPriceContract,
        functionName: "getCollateralPrice",
        args: [info.addressLP],
      }
    ])) as any,
    query: {
      // enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data || data.length < collateralInfos.length * 2 || collateralInfos.length === 0) {
    return {};
  }

  const flatArray = data.map((d) => d.result as bigint[]);
  const amounts = Object.fromEntries(
    [...Array(Math.ceil(flatArray.length / 2))].map(() => flatArray.splice(0, 2)).map((item, i) => ([collateralInfos[i].addressLP, {
      proportions: {
        tokenA: item[0]?.[0],
        tokenB: item[0]?.[1],
      },
      collateralPrice: item[1]?.[2],
    }])));

  return amounts;
};
export default useGetCollateralProportions;
