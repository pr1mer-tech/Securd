"use client";

import type { Analytics, Dex, Pool, Token } from "@/db/schema";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import useChainURL from "@/lib/hooks/useChain";
import useBorrowerLt from "@/lib/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";
import useCollateralAmountPrice from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import useCollateralPool from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import useCollateralPoolBalances from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralPoolBalance";
import useGetCollateralProportions from "@/lib/hooks/wagmiSH/viewFunctions/farm/useGetCollateralProportions";
import useAssetPriceOracle from "@/lib/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useBalanceCoins from "@/lib/hooks/wagmiSH/viewFunctions/useBalanceCoins";
import useLDtokens from "@/lib/hooks/wagmiSH/viewFunctions/useLDtokens";
import { useLendingPool } from "@/lib/hooks/wagmiSH/viewFunctions/useLendingPool";
import type { ReserveInfo } from "@/lib/types/save.types";
import { useEffect } from "react";
import type { Address } from "viem";

export default function FarmAddressSync({
	children,
	address,
	preReservesInfo,
	pool,
	chainId,
}: {
	children: React.ReactNode;
	address: Address;
	preReservesInfo: ReserveInfo[];
	pool:
		| (Pool & {
				token_0: Token | null;
				token_1: Token | null;
				dex: Dex | null;
				analytics: Analytics[] | null;
		  })
		| undefined;
	chainId: string | undefined;
}) {
	useChainURL(chainId);
	const coinPrices = useAssetPriceOracle(preReservesInfo);
	const { reservesInfo } = useLendingPool(preReservesInfo, coinPrices);

	const collateralsInfos = useCollateralPool(pool ? [pool] : []);

	const collateralInfo = collateralsInfos.find(
		(info) => info.addressLP === address,
	);
	const collateralAmountPrice = useCollateralAmountPrice(
		collateralInfo ? [collateralInfo] : [],
	);
	const borrowerLt = useBorrowerLt(
		collateralInfo ? [collateralInfo] : [],
		collateralAmountPrice,
	);

	const collateralPoolBalances = useCollateralPoolBalances(
		collateralInfo ? [collateralInfo] : [],
	);
	const collateralProportions = useGetCollateralProportions(
		collateralInfo ? [collateralInfo] : [],
		collateralAmountPrice,
	);
	const userBalance = useBalanceCoins(
		collateralInfo ? [{ address: collateralInfo.addressLP }] : [],
	);

	const { balanceLDTokens } = useLDtokens(reservesInfo ? reservesInfo : []);

	useEffect(() => {
		useFarmAddressStore.setState({
			reservesInfo,
			collateralInfo,
			collateralAmountPrice: collateralAmountPrice[address],
			coinPrices,
			balanceLDTokens,
			borrowerLt: borrowerLt[address],
			collateralPoolBalance: collateralPoolBalances[address],
			collateralProportions: collateralProportions[address],
			userBalance: userBalance[address],
		});
	}, [reservesInfo, collateralInfo, collateralAmountPrice, coinPrices, borrowerLt, collateralPoolBalances, address, collateralProportions, userBalance, balanceLDTokens]);
	return children;
}
