"use client";

import { useFarmStore } from "@/lib/data/farmStore";
import useCollateralAmountPrice from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import useCollateralPool from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";

export default function FarmSync({ children }: { children: React.ReactNode }) {
    const { reservesInfo } = useLendingPool();
    const coinPrices = useAssetPriceOracle(reservesInfo);

    const collateralsInfos = useCollateralPool();
    const collateralAmountPrice = useCollateralAmountPrice(collateralsInfos)

    useEffect(() => {
        useFarmStore.setState({
            reservesInfo,
            collateralsInfos,
            collateralAmountPrice,
            coinPrices
        })
    }, [reservesInfo, collateralsInfos, collateralAmountPrice, coinPrices]);
    return children;
}