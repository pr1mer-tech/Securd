import AllAccounts from "@/components/farm/AllAccounts";
import Accounts from "@/components/farm/Accounts";
import InfoCard from "@/components/farm/InfoCard";
import FarmSync from "./FarmSync";
import { db } from "@/db/db";
import { tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import type { Analytics, Dex, Pool, Token } from "@/db/schema";

export const metadata = {
	title: "Secur·d - Farm",
	description: "Farm your assets and earn interest on your crypto.",
};

export default async function Farm({
	searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const chain =
		typeof searchParams.chain === "string" ? searchParams.chain : "1";
	const pools = await db.query.blockchain.findFirst({
		where: (row, { eq }) => eq(row.chain_id, Number(chain)),
		with: {
			pools: {
				with: {
					token_0: true,
					token_1: true,
					dex: true,
					analytics: {
						orderBy: (row, { desc }) => [desc(row.date)],
						limit: 1,
					},
					mirror: {
						with: {
							analytics: {
								orderBy: (row, { desc }) => [desc(row.date)],
								limit: 1,
							},
						},
					}
				},
			},
		},
	});

	const tokenList = pools?.pools
		.flatMap(
			(
				pool: Pool & {
					token_0: Token | null;
					token_1: Token | null;
					dex: Dex | null;
					analytics: Analytics[] | null;
				},
			) => [pool.token_0, pool.token_1],
		)
		.filter((token) => token !== null);
	const uniqueTokenList =
		tokenList?.filter(
			(token, index, self) =>
				self.findIndex((t) => t?.token_address === token?.token_address) ===
				index,
		) ?? [];

	const _pools = {
		...pools,
		pools: pools?.pools.map((pool) => ({
			...pool,
			analytics: (pool.mirror?.analytics.length ?? 0) > 0 ? pool.mirror?.analytics : pool.analytics,
		})),
	} as typeof pools;

	const reservesInfo = await Promise.all(
		uniqueTokenList.map((token) => tokenToReserveInfo(token, _pools)) ?? [],
	);

	return (
		<FarmSync
			preReservesInfo={reservesInfo}
			pools={_pools?.pools ?? []}
			chainId={chain}
		>
			<div className="max-w-7xl mx-auto pt-8 px-4">
				<h1 className="font-poppins text-4xl text-white">Farm</h1>
				<InfoCard />
			</div>
			<Accounts />
			<div className="max-w-7xl mx-auto px-4">
				<AllAccounts />
			</div>
		</FarmSync>
	);
}
