import Graphs from "@/components/analytics/address/Graphs";
import InfoCard from "@/components/analytics/address/InfoCard";
import Other from "@/components/analytics/address/Other";
import QuickView from "@/components/analytics/address/QuickView";
import Rates from "@/components/analytics/address/Rates";
import { Card } from "@/components/ui/card";
import {
	MenuTabs,
	MenuTabsList,
	MenuTabsTrigger,
} from "@/components/ui/menu-tabs";
import { db } from "@/db/db";
import { pool } from "@/db/schema";
import {
	type PoolDetails,
	tokenToReserveInfo,
	analyticsToCollateralInfoServer,
} from "@/lib/helpers/analytics.helper";
import type { ReserveInfo } from "@/lib/types/save.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Address } from "viem";

export async function generateStaticParams() {
	const pools = await db.select({ id: pool.id_pool }).from(pool).execute();

	return pools.map((pool) => ({ params: { address: String(pool.id) } }));
}

export default async function AnalyticsAddress({
	params,
}: { params: { address: string } }) {
	// limitDate: 7 days ago
	const limitDate = new Date();
	// Set region to GMT
	limitDate.setUTCDate(limitDate.getDate() - 365);
	// Set time to 00:00:00 of the day
	limitDate.setUTCHours(0, 0, 0, 0);

	const analyticsResult = await db.query.pool.findFirst({
		where: (row, { eq }) => eq(row.id_pool, Number(params.address)),
		with: {
			analytics: {
				orderBy: (row, { asc }) => [asc(row.date)],
				where: (row, { and, eq, gte }) =>
					and(
						eq(row.id_pool, Number(params.address)),
						gte(row.date, limitDate),
					),
			},
			blockchain: true,
			dex: true,
			token_0: {
				with: {
					prices: {
						orderBy: (row, { asc }) => [asc(row.date)],
						where: (row, { gte }) => gte(row.date, limitDate),
					},
				},
			},
			token_1: {
				with: {
					prices: {
						orderBy: (row, { asc }) => [asc(row.date)],
						where: (row, { gte }) => gte(row.date, limitDate),
					},
				},
			},
		},
	});

	if (!analyticsResult) {
		return <div>No data found</div>;
	}

	const hasMirrored = await db.query.pool.findFirst({
		where: (row, { eq }) => eq(row.mirror_pool, analyticsResult?.id_pool),
		columns: {
			pool_address: true,
		},
		with: {
			blockchain: {
				columns: {
					chain_id: true,
				},
			},
			token_0: {
				columns: {
					token_address: true,
				},
			},
			token_1: {
				columns: {
					token_address: true,
				},
			},
		},
	});

	const reservesInfo: ReserveInfo[] = await Promise.all([
		tokenToReserveInfo(
			analyticsResult?.token_0,
			analyticsResult?.blockchain,
			(hasMirrored?.token_0?.token_address ??
				analyticsResult?.token_0?.token_address) as Address,
			(hasMirrored?.blockchain?.chain_id ??
				analyticsResult?.blockchain?.chain_id) as number,
		),
		tokenToReserveInfo(
			analyticsResult?.token_1,
			analyticsResult?.blockchain,
			(hasMirrored?.token_1?.token_address ??
				analyticsResult?.token_1?.token_address) as Address,
			(hasMirrored?.blockchain?.chain_id ??
				analyticsResult?.blockchain?.chain_id) as number,
		),
	]);

	const collateralInfo = await analyticsToCollateralInfoServer(
		analyticsResult,
		analyticsResult?.analytics[0],
		(hasMirrored?.pool_address ?? analyticsResult?.pool_address) as Address,
		hasMirrored?.blockchain?.chain_id ?? analyticsResult?.blockchain?.chain_id,
	);

	const poolInfo = {
		...analyticsResult,
		reservesInfo,
	} as PoolDetails;

	return (
		<>
			<Link
				href="/analytics"
				className="absolute left-5 top-5 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110"
			>
				<ArrowLeft className="w-6 h-6" />
				Back
			</Link>
			<div className="max-w-7xl mx-auto pt-8 px-4">
				<h1 className="font-poppins text-4xl text-white mt-8">Pool Details</h1>
				<Card className="my-4 p-4">
					<MenuTabs
						defaultValue="pool"
						className="text-center flex flex-row justify-center gap-4"
					>
						<div className="flex flex-col basis-1/3 gap-4">
							<InfoCard poolInfo={poolInfo} className="" />
							<Rates poolInfo={poolInfo} collateralInfo={collateralInfo} className="" />
							<Other poolInfo={poolInfo} className="" />
						</div>
						<div className="flex flex-col gap-4 basis-2/3">
							<QuickView poolInfo={poolInfo} />
							<Graphs poolInfo={poolInfo} />
						</div>
					</MenuTabs>
				</Card>
			</div>
		</>
	);
}
