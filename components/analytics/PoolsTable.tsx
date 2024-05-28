import { db } from "@/db/db";
import PoolsTableClient from "./PoolTableClient";
import {
	type PoolTableRows,
	tokenToReserveInfo,
} from "@/lib/helpers/analytics.helper";
import type { ReserveInfo } from "@/lib/types/save.types";

export default async function PoolsTable() {
	const blockchain = 2;
	const analytics = await db.query.analytics.findMany({
		orderBy: (row, { desc }) => [desc(row.date)],
		where: (row, { sql }) => sql`
        ${row.id_analytics} IN (
            SELECT a.id_analytics
            FROM analytics a
            INNER JOIN pool p ON a.id_pool = p.id_pool
            INNER JOIN (
                SELECT id_pool, MAX(date) AS max_date
                FROM analytics
                GROUP BY id_pool
            ) latest ON a.id_pool = latest.id_pool AND a.date = latest.max_date
            WHERE p.id_blockchain = ${blockchain}
        )
    `,
		with: {
			pool: {
				with: {
					blockchain: true,
					dex: true,
					token_0: {
						with: {
							prices: {
								orderBy: (row, { desc }) => [desc(row.date)],
								limit: 1,
							},
						},
					},
					token_1: {
						with: {
							prices: {
								orderBy: (row, { desc }) => [desc(row.date)],
								limit: 1,
							},
						},
					},
				},
			},
		},
	});

	const reservesInfo: ReserveInfo[][] = await Promise.all(
		analytics.map(async (row) => {
			const token_0 = row.pool?.token_0;
			const token_1 = row.pool?.token_1;
			const chain = row.pool?.blockchain;

			return [
				await tokenToReserveInfo(token_0, chain),
				await tokenToReserveInfo(token_1, chain),
			];
		}),
	);

	const data = analytics.map((row, index) => ({
		...row,
		pool: {
			...row.pool,
			reservesInfo: reservesInfo[index],
		},
	})) as PoolTableRows[];

	return <PoolsTableClient data={data ?? []} />;
}
