"use client";

import { useSaveStore } from "@/lib/data/saveStore";
import useChainURL from "@/lib/hooks/useChain";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import type { ReserveInfo } from "@/lib/types/save.types";
import { useEffect } from "react";

export default function SaveSync({
	children,
	preReservesInfo,
	chainId,
}: {
	children: React.ReactNode;
	preReservesInfo: ReserveInfo[];
	chainId: string | undefined;
}) {
	useChainURL(chainId);
	const coinPrices = useAssetPriceOracle(preReservesInfo);
	const { reservesInfo } = useLendingPool(preReservesInfo, coinPrices);

	const { balanceLDTokens } = useLDtokens(reservesInfo);
	const userDeposit = useGetLenderSupply(reservesInfo);

	useEffect(() => {
		useSaveStore.setState({
			reservesInfo,
			coinPrices,
			balanceLDTokens,
			userDeposit,
		});
	}, [reservesInfo, coinPrices, balanceLDTokens, userDeposit]);

	return children;
}
