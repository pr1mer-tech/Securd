import { collateralPriceContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos } from "@/lib/types/farm.types";
import { Address, erc20Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useCollateralPoolBalances: (collateralInfos: CollateralInfos[]) => Record<Address, bigint> = (collateralInfos) => {
    const { isConnected } = useAccount();

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