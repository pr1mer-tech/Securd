"use client";

import { Blockchain, Pool } from "@/db/schema";
import { useSaveStore } from "@/lib/data/saveStore";
import useChainURL from "@/lib/hooks/useChain";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import type { ReserveInfo } from "@/lib/types/save.types";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

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
	const { reservesInfo } = useLendingPool(preReservesInfo);

	const coinPrices = useAssetPriceOracle(reservesInfo);
	const { balanceLDTokens } = useLDtokens(reservesInfo);
	const userDeposit = useGetLenderSupply(reservesInfo);

	console.log({
		reservesInfo,
		coinPrices,
		balanceLDTokens,
		userDeposit,
	});

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
