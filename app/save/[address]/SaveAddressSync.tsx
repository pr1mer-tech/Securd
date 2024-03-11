"use client";

import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { useSaveStoreBase } from "@/lib/data/saveStore";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import { useEffect } from "react";

export default function SaveAddressSync({ children, address }: { children: React.ReactNode, address: string }) {
    const { reservesInfo } = useLendingPool();

    useEffect(() => {
        useSaveAddressStore.setState({
            reserveInfo: reservesInfo.find((reserve) => reserve.address === address),
        })
    }, [address, reservesInfo]);
    return children;
}