"use client";

import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import useBorrowerLt from "@/lib/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";
import useCollateralAmountPrice from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import useCollateralPool from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import useCollateralPoolBalances from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPoolBalance";
import useGetCollateralProportions from "@/lib/hooks/wagmiSH/viewFunctions/farm/useGetCollateralProportions";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useBalanceCoins from "@/lib/hooks/wagmiSH/viewFunctions/useBalanceCoins";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";
import { Address } from "viem";

export default function FarmAddressSync({ children, address }: { children: React.ReactNode, address: Address }) {
    const { reservesInfo } = useLendingPool();
    const coinPrices = useAssetPriceOracle(reservesInfo);

    const collateralsInfos = useCollateralPool();

    const collateralInfo = collateralsInfos.find(info => info.addressLP === address);
    const collateralAmountPrice = useCollateralAmountPrice(collateralInfo ? [collateralInfo] : []);
    const borrowerLt = useBorrowerLt(collateralInfo ? [collateralInfo] : [], collateralAmountPrice);

    const collateralPoolBalances = useCollateralPoolBalances(collateralInfo ? [collateralInfo] : []);
    const collateralProportions = useGetCollateralProportions(collateralInfo ? [collateralInfo] : [], collateralAmountPrice);
    const userBalance = useBalanceCoins(collateralInfo ? [{ address: collateralInfo.addressLP }] : []);

    useEffect(() => {
        useFarmAddressStore.setState({
            reservesInfo,
            collateralInfo,
            collateralAmountPrice: collateralAmountPrice[address],
            coinPrices,
            borrowerLt: borrowerLt[address],
            collateralPoolBalance: collateralPoolBalances[address],
            collateralProportions: collateralProportions[address],
            userBalance: userBalance[address],
        })
    }, [reservesInfo, collateralInfo, collateralAmountPrice, coinPrices, borrowerLt, collateralPoolBalances, address, collateralProportions, userBalance]);
    return children;
}