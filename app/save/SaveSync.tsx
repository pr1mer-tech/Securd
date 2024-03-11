"use client";

import { useSaveStore } from "@/lib/data/saveStore";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";

export default function SaveSync({ children }: { children: React.ReactNode }) {
    const { reservesInfo } = useLendingPool();
    const coinPrices = useAssetPriceOracle(reservesInfo);
    const { balanceLDTokens } = useLDtokens(reservesInfo);
    const userDeposit = useGetLenderSupply(reservesInfo);

    useEffect(() => {
        useSaveStore.setState({
            reservesInfo,
            coinPrices,
            balanceLDTokens,
            userDeposit,
        })
    }, [reservesInfo, coinPrices, balanceLDTokens, userDeposit]);
    return children;
}