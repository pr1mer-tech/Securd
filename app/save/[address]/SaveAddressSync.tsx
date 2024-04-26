"use client";

import { Pool } from "@/db/schema";
import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { useSaveStoreBase } from "@/lib/data/saveStore";
import { isEqualAddress } from "@/lib/helpers/main.helpers";
import useChainURL from "@/lib/hooks/useChain";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useBalanceCoins from "@/lib/hooks/wagmiSH/viewFunctions/useBalanceCoins";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import type { Coins, ReserveInfo } from "@/lib/types/save.types";
import { useEffect } from "react";
import type { Address } from "viem";

export default function SaveAddressSync({
    children,
    address,
    preReservesInfo,
    chainId
}: {
    children: React.ReactNode,
    address: Address,
    preReservesInfo: ReserveInfo[],
    chainId: string | undefined,
}) {
    useChainURL(chainId);
    const { reservesInfo } = useLendingPool(preReservesInfo);
    const reserveInfo = reservesInfo.find((reserve) => isEqualAddress(reserve.address, address));
    const coinPrices = useAssetPriceOracle(reserveInfo ? [reserveInfo] : []);
    const { balanceLDTokens } = useLDtokens(reserveInfo ? [reserveInfo] : []);
    const userDeposit = useGetLenderSupply(reserveInfo ? [reserveInfo] : []);
    const userBalance = useBalanceCoins(reserveInfo ? [reserveInfo] : []);

    useEffect(() => {
        useSaveAddressStore.setState({
            reserveInfo,
            coinPrice: coinPrices[reserveInfo?.symbol as keyof Coins],
            balanceLDToken: balanceLDTokens[address],
            userDeposit: userDeposit[address],
            userBalance: userBalance[reserveInfo?.address as Address],
        })
    }, [address, balanceLDTokens, coinPrices, reserveInfo, reservesInfo, userBalance, userDeposit]);
    return children;
}