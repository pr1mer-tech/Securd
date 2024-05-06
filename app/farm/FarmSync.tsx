"use client";

import {
	Analytics,
	Blockchain,
	type Dex,
	type Pool,
	type Token,
} from "@/db/schema";
import { useFarmStore } from "@/lib/data/farmStore";
import useChainURL from "@/lib/hooks/useChain";
import useBorrowerLt from "@/lib/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";
import useCollateralAmountPrice from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import useCollateralPool from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import useCollateralPoolBalances from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPoolBalance";
import useGetCollateralProportions from "@/lib/hooks/wagmiSH/viewFunctions/farm/useGetCollateralProportions";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import type { ReserveInfo } from "@/lib/types/save.types";
import { useEffect } from "react";

export default function FarmSync({
	children,
	preReservesInfo,
	pools,
	chainId,
}: {
	children: React.ReactNode;
	preReservesInfo: ReserveInfo[];
	pools: (Pool & {
		token_0: Token | null;
		token_1: Token | null;
		dex: Dex | null;
		analytics: Analytics[] | null;
	})[];
	chainId: string | undefined;
}) {
	useChainURL(chainId);
	const { reservesInfo } = useLendingPool(preReservesInfo);
	const coinPrices = useAssetPriceOracle(reservesInfo);

	const collateralsInfos = useCollateralPool(pools);
	const collateralAmountPrice = useCollateralAmountPrice(collateralsInfos);
	const borrowerLt = useBorrowerLt(collateralsInfos, collateralAmountPrice);

	const collateralPoolBalances = useCollateralPoolBalances(collateralsInfos);
	const collateralProportions = useGetCollateralProportions(
		collateralsInfos,
		collateralAmountPrice,
	);

	useEffect(() => {
		useFarmStore.setState({
			reservesInfo,
			collateralsInfos,
			collateralAmountPrice,
			coinPrices,
			borrowerLt,
			collateralPoolBalances,
			collateralProportions,
		});
	}, [
		reservesInfo,
		collateralsInfos,
		collateralAmountPrice,
		coinPrices,
		borrowerLt,
		collateralPoolBalances,
		collateralProportions,
	]);
	return children;
}
