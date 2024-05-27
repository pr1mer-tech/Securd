import { db } from "@/db/db";
import { inngest } from "@/lib/inngest/client";
import { getPairDayData, updatePairDayData } from "./vvs/pairs";
import { type Analytics, type Price, analytics, price } from "@/db/schema";
import type { PgTable } from "drizzle-orm/pg-core";
import { type SQL, getTableColumns, sql } from "drizzle-orm";

const buildConflictUpdateColumns = <
    T extends PgTable,
    Q extends keyof T['_']['columns']
>(
    table: T,
    columns: Q[],
) => {
    const cls = getTableColumns(table);
    return columns.reduce((acc, column) => {
        const colName = cls[column].name;
        acc[column] = sql.raw(`excluded.${colName}`);
        return acc;
    }, {} as Record<Q, SQL>);
};

export const analyticsRoutine = inngest.createFunction(
    { id: "update-analytics" },
    { event: "app/update-analytics" },
    async ({ event, step }) => {
        const pairs = await step.run("get-pairs-db", async () => {
            // Get pairs
            const pairs = await db.query.pool.findMany({
                where: (row, { eq }) => eq(row.id_blockchain, 2), // Cronos
                with: {
                    token_0: true,
                    token_1: true,
                }
            });
            return pairs;
        });
        const nbDays = 2 * 30;
        await step.run("get-pair-data-and-update-db", async () => {
            // Get pair data
            const _pairData = pairs.map(async (pair) => {
                const data = await getPairDayData(pair.pool_address, nbDays);
                const updatedData = await updatePairDayData(
                    data,
                    pair.token_0?.token_address ?? "",
                    pair.token_1?.token_address ?? "",
                    nbDays
                );
                return { updatedData, pair };
            })

            const pairData = await Promise.all(_pairData);

            // Update analytics
            await db.transaction(async (tx) => {
                await tx.insert(analytics).values(pairData.flatMap((data) => data.updatedData.map((dayData) => ({
                    id_pool: data.pair.id_pool,
                    date: dayData.date,
                    quantity_token_0: dayData.reserve0,
                    quantity_token_1: dayData.reserve1,
                    quantity_token_lp: dayData.liquidity,
                    volume_token_0: dayData.dailyVolumeToken0,
                    volume_token_1: dayData.dailyVolumeToken1,
                    // mrm,
                    // volatility_score
                    // lrm
                    // liquidity_score
                    lp_apy_1d: dayData.lp_apy_1d,
                    lp_vs_hold_apy_1d: dayData.lp_versus_hold_apy_1d,
                    fee_apy_1d: dayData.fees_apy_1d,
                    il_apy_1d: dayData.il_apy_1d,
                    hold_apy_1d: dayData.hold_apy_1d,
                    lp_apy_1m: dayData.lp_apy_1m,
                    lp_vs_hold_apy_1m: dayData.lp_versus_hold_apy_1m,
                    fee_apy_1m: dayData.fees_apy_1m,
                    il_apy_1m: dayData.il_apy_1m,
                    hold_apy_1m: dayData.hold_apy_1m,
                    lp_apy_3m: dayData.lp_apy_3m,
                    lp_vs_hold_apy_3m: dayData.lp_versus_hold_apy_3m,
                    fee_apy_3m: dayData.fees_apy_3m,
                    il_apy_3m: dayData.il_apy_3m,
                    hold_apy_3m: dayData.hold_apy_3m,
                    lp_apy_1y: dayData.lp_apy_1y,
                    lp_vs_hold_apy_1y: dayData.lp_versus_hold_apy_1y,
                    fee_apy_1y: dayData.fees_apy_1y,
                    il_apy_1y: dayData.il_apy_1y,
                    hold_apy_1y: dayData.hold_apy_1y,
                } as Analytics))))
                    .onConflictDoNothing({
                        target: [analytics.id_pool, analytics.date],
                        // set: buildConflictUpdateColumns(analytics, [
                        //     'quantity_token_0',
                        //     'quantity_token_1',
                        //     'quantity_token_lp',
                        //     'volume_token_0',
                        //     'volume_token_1',
                        //     'mrm',
                        //     'volatility_score',
                        //     'lrm',
                        //     'liquidity_score',
                        //     'lp_apy_1d',
                        //     'lp_vs_hold_apy_1d',
                        //     'fee_apy_1d',
                        //     'il_apy_1d',
                        //     'hold_apy_1d',
                        //     'lp_apy_1m',
                        //     'lp_vs_hold_apy_1m',
                        //     'fee_apy_1m',
                        //     'il_apy_1m',
                        //     'hold_apy_1m',
                        //     'lp_apy_3m',
                        //     'lp_vs_hold_apy_3m',
                        //     'fee_apy_3m',
                        //     'il_apy_3m',
                        //     'hold_apy_3m',
                        //     'lp_apy_1y',
                        //     'lp_vs_hold_apy_1y',
                        //     'fee_apy_1y',
                        //     'il_apy_1y',
                        //     'hold_apy_1y',
                        // ]),
                    })

                await tx.insert(price).values(pairData.flatMap((data) => data.updatedData.map((dayData) => ({
                    date: dayData.date,
                    id_token: data.pair.token_0?.id_token ?? "",
                    price: dayData.priceToken0inDollars,
                    price_currency: "USD"
                } as Price))))
                    .onConflictDoNothing({
                        target: [price.id_token, price.date],
                        // set: buildConflictUpdateColumns(price, ['price']),
                    })

                await tx.insert(price).values(pairData.flatMap((data) => data.updatedData.map((dayData) => ({
                    date: dayData.date,
                    id_token: data.pair.token_1?.id_token ?? "",
                    price: dayData.priceToken1inDollars,
                    price_currency: "USD"
                } as Price))))
                    .onConflictDoNothing({
                        target: [price.id_token, price.date],
                        // set: buildConflictUpdateColumns(price, ['price']),
                    })
            });

            return pairData;
        });
    },
);
