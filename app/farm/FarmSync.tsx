"use client";

import { useFarmStore } from "@/lib/data/farmStore";
import useBorrowerLt from "@/lib/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";
import useCollateralAmountPrice from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import useCollateralPool from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import useCollateralPoolBalances from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPoolBalance";
import useGetCollateralProportions from "@/lib/hooks/wagmiSH/viewFunctions/farm/useGetCollateralProportions";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";

export default function FarmSync({ children }: { children: React.ReactNode }) {
    const { reservesInfo } = useLendingPool();
    const coinPrices = useAssetPriceOracle(reservesInfo);

    const collateralsInfos = useCollateralPool();
    const collateralAmountPrice = useCollateralAmountPrice(collateralsInfos);
    const borrowerLt = useBorrowerLt(collateralsInfos, collateralAmountPrice);

    const collateralPoolBalances = useCollateralPoolBalances(collateralsInfos);
    const collateralProportions = useGetCollateralProportions(collateralsInfos, collateralAmountPrice);

    useEffect(() => {
        useFarmStore.setState({
            reservesInfo,
            collateralsInfos,
            collateralAmountPrice,
            coinPrices,
            borrowerLt,
            collateralPoolBalances,
            collateralProportions
        })
    }, [reservesInfo, collateralsInfos, collateralAmountPrice, coinPrices, borrowerLt, collateralPoolBalances, collateralProportions]);
    return children;
}