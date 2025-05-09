// @ts-nocheck
import { abiLendingPool } from "@/lib/constants/abi/abiLendingPool";
import { lendingPoolContract } from "@/lib/constants/wagmiConfig/wagmiConfig";
import type { ReserveInfo } from "@/lib/types/save.types";
import { erc20Abi, type Address } from "viem";
import { readContract } from "wagmi/actions";
import { useConfig, useReadContract, useReadContracts } from "wagmi";
import { useEffect } from "react";

export const useLendingPool = (
	preReservesInfo: ReserveInfo[],
	prices?: Record<keyof Coins, number>,
) => {
	const { data } = useReadContracts({
		contracts: preReservesInfo.flatMap((pool) => [
			{
				...lendingPoolContract,
				functionName: "reserveInfos",
				args: [pool.address as Address],
			},
			{
				address: pool.address as Address,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [lendingPoolContract.address],
			},
		]),
		query: {
			// enabled: isConnected,
			// refetchInterval: 10000,
		},
	});

	if (!data || data.length !== preReservesInfo.length * 2) {
		return {
			reservesInfo: [],
		};
	}

	const reservesInfo: ReserveInfo[] = preReservesInfo.map(
		(reserveInfo, index) => ({
			...reserveInfo,
			supplyCap: data[index * 2].result?.[0],
			liquidity: data[index * 2 + 1].result, //* BigInt(Math.round((prices?.[reserveInfo.symbol as keyof Coins] ?? 0) * 1e9)) / (10n ** 9n),
			supply: data[index * 2].result?.[1],
			debt: data[index * 2].result?.[2],
			fee: data[index * 2].result?.[3],
			lastBlock: data[index * 2].result?.[4],
			lastTime: data[index * 2].result?.[5],
			isActivated: data[index * 2].result?.[6],
			interestRateInfo: data[index * 2].result?.[7],
			tokenInfo: data[index * 2].result?.[8],
		}),
	);

	return {
		reservesInfo,
	};
};
