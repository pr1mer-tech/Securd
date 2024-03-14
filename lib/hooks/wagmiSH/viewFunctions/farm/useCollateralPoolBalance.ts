import { collateralPriceContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import { CollateralInfos } from "@/lib/types/farm.types";
import { Address, erc20Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useCollateralPoolBalances: (collateralInfos: CollateralInfos[]) => Record<Address, bigint> = (collateralInfos) => {
    const { isConnected, address } = useAccount();

    const { data } = useReadContracts({
        contracts: collateralInfos.map(info => ([{
            address: info.addressLP,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [info.address],
        }, {
            ...collateralPriceContract,
            functionName: "getCollateralPrice",
            args: [info.addressLP],
        }])).flat(),
        query: {
            enabled: isConnected,
            refetchInterval: 10000,
        },
    });

    if (!data || data.length < collateralInfos.length * 2) {
        return {};
    }

    const collateralPoolBalances = Object.fromEntries(
        collateralInfos.map((info, index) => {
            const baseIndex = index * 2;
            const balance = data[baseIndex].result as bigint;
            const collatArray = data[baseIndex + 1].result;
            if (!Array.isArray(collatArray)) return [info.addressLP, { balance, collateralPrice: 0n }];
            const collateralPrice = collatArray[2] as bigint;

            return [
                info.addressLP,
                { balance, collateralPrice }
            ];
        })
    );

    return collateralPoolBalances;
}

export default useCollateralPoolBalances;