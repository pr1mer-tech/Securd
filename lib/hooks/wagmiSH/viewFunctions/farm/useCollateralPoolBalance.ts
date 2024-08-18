import type { CollateralInfos } from "@/lib/types/farm.types";
import { type Address, erc20Abi } from "viem";
import { useReadContracts } from "wagmi";

const useCollateralPoolBalances: (collateralInfos: CollateralInfos[]) => Record<Address, bigint> = (collateralInfos) => {

    const { data } = useReadContracts({
        contracts: collateralInfos.map(info => ({
            address: info.addressLP,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [info.address],
        })),
        query: {
            // enabled: isConnected,
            refetchInterval: 10000,
        },
    });

    if (!data || data.length < collateralInfos.length) {
        return {};
    }

    return Object.fromEntries(
        collateralInfos.map((info, index) => {
            return [
                info.addressLP,
                data[index].result as bigint,
            ];
        })
    );
}

export default useCollateralPoolBalances;