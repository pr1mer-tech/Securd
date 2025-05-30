import AllAccounts from "@/components/save/AllAccounts";
import Accounts from "@/components/save/Accounts";
import InfoCard from "@/components/save/InfoCard";
import SaveSync from "./SaveSync";
import { db } from "@/db/db";
import { tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import type { Pool, Token } from "@/db/schema";

export const metadata = {
	title: "Secur·d - Save",
	description: "Save your assets and earn interest on your crypto.",
};

export default async function Save({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const chain = typeof params.chain === "string" ? params.chain : "338";
	const pools = await db.query.blockchain.findFirst({
		where: (row, { eq }) => eq(row.chain_id, Number(chain)),
		with: {
			pools: {
				with: {
					token_0: true,
					token_1: true,
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
				},
			) => [pool.token_0, pool.token_1],
		)
		.filter((token) => token !== null);
	const uniqueTokenList =
		tokenList?.filter(
			(token, index, self) =>
				self.findIndex(
					(t) => t?.token_address === token?.token_address,
				) === index,
		) ?? [];

	const reservesInfo = await Promise.all(
		uniqueTokenList.map((token) => tokenToReserveInfo(token, pools)) ?? [],
	);

	return (
		<SaveSync preReservesInfo={reservesInfo} chainId={chain}>
			<div className="max-w-7xl mx-auto pt-8 px-4">
				<h1 className="font-poppins text-4xl text-white">Save</h1>
				<InfoCard />
			</div>
			<Accounts />
			<div className="max-w-7xl mx-auto px-4">
				<AllAccounts />
			</div>
		</SaveSync>
	);
}
