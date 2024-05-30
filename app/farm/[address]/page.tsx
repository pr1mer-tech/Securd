import Link from "next/link";
import FarmAddressSync from "./FarmAddressSync";
import { ArrowLeft } from "lucide-react";
import FarmAddressTitle from "./FarmAddressTitle";
import InfoAddressCard from "@/components/farm/address/InfoAddressCard";
import type { Address } from "viem";
import PoolDetails from "@/components/farm/address/PoolDetails";
import { db } from "@/db/db";
import { tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import { analytics } from "@/db/schema";

export default async function FarmAddress({
	params,
	searchParams,
}: {
	params: { address: Address };
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const chain =
		typeof searchParams.chain === "string" ? searchParams.chain : "1";
	const _token = await db.query.pool.findFirst({
		where: (row, { eq }) => eq(row.pool_address, params.address),
		with: {
			token_0: true,
			token_1: true,
			dex: true,
			blockchain: true,
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
	});

	const token = {
		..._token,
		analytics: _token?.mirror?.analytics || _token?.analytics,
	} as typeof _token;

	const reservesInfo = await Promise.all([
		tokenToReserveInfo(token?.token_0, token?.blockchain),
		tokenToReserveInfo(token?.token_1, token?.blockchain),
	]);

	return (
		<FarmAddressSync
			address={params.address}
			pool={token}
			preReservesInfo={reservesInfo}
			chainId={chain}
		>
			<Link
				href="/farm"
				className="absolute left-5 top-5 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110"
			>
				<ArrowLeft className="w-6 h-6" />
				Back
			</Link>
			<div className="max-w-7xl mx-auto pt-16 px-4">
				<div className="flex flex-row justify-between">
					<h1 className="font-poppins text-4xl text-white">Farm</h1>
					<div className="flex flex-row items-center">
						<FarmAddressTitle />
					</div>
				</div>
			</div>
			<div className="relative">
				<InfoAddressCard />
				<div className="absolute top-10 w-full h-full before:absolute before:inset-0 before:bg-securdPrimaryLight  before:w-full z-[-1] pb-4 before:h-full" />
			</div>
			<div className="max-w-7xl mx-auto px-4 my-16">
				<PoolDetails />
			</div>
		</FarmAddressSync>
	);
}
