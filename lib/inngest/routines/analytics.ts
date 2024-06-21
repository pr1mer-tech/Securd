import { db } from "@/db/db";
import { inngest } from "@/lib/inngest/client";
import { getPairDayData, updatePairDayData } from "./vvs/pairs";
import { type Analytics, type Price, analytics, price } from "@/db/schema";

export const analyticsRoutine = inngest.createFunction(
    { id: "update-analytics" },
    {
        // Cron every day at 12:00 AM
        cron: "0 0 * * *",
    },
    async ({ step }) => {
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
        const nbDays = 2 * 365;
        await step.run("get-pair-data-and-update-db", async () => {
            // Get pair data
            const _pairData = pairs.map(async (pair) => {
                const data = await getPairDayData(pair.pool_address, nbDays);
                const updatedData = await updatePairDayData(
                    data,
                    pair.pool_address,
                    data[0].token0.id,
                    data[0].token1.id,
                    nbDays
                );
                return { updatedData, pair };
            })

            const pairData = await Promise.all(_pairData);

            // Helper function to split an array into chunks of a specified size
            function chunk<T>(array: T[], size: number): T[][] {
                return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
                    array.slice(i * size, (i + 1) * size)
                );
            }

            // Update analytics
            await db.transaction(async (tx) => {
                // Count number of rows to be inserted
                const count = pairData.reduce((acc, data) => acc + data.updatedData.length, 0);
                console.log(`Inserting ${count} rows`);

                // Split the data into chunks of 1000 rows
                const chunkSize = 1000;
                const analyticsChunks = chunk(
                    pairData.flatMap((data) =>
                        data.updatedData.map((dayData) => ({
                            id_pool: data.pair.id_pool,
                            date: dayData.date,
                            quantity_token_0: dayData.reserve0,
                            quantity_token_1: dayData.reserve1,
                            quantity_token_lp: dayData.liquidity,
                            volume_token_0: dayData.dailyVolumeToken0,
                            volume_token_1: dayData.dailyVolumeToken1,
                            mrm: dayData.mrm,
                            volatility_score: dayData.volatility_score,
                            lrm: dayData.lrm,
                            liquidity_score: dayData.liquidity_score,
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
                        } as Analytics))
                    ),
                    chunkSize
                );

                for (const chunk of analyticsChunks) {
                    await tx
                        .insert(analytics)
                        .values(chunk)
                        .onConflictDoNothing({
                            target: [analytics.id_pool, analytics.date],
                        });
                }

                console.log(`Inserted ${analyticsChunks.length} analytics records`);

                const priceChunks = chunk(
                    pairData.flatMap((data) =>
                        data.updatedData.flatMap((dayData) => [
                            {
                                date: dayData.date,
                                id_token: data.pair.token_0?.id_token ?? "",
                                price: dayData.priceToken0inDollars,
                                price_currency: "USD",
                            },
                            {
                                date: dayData.date,
                                id_token: data.pair.token_1?.id_token ?? "",
                                price: dayData.priceToken1inDollars,
                                price_currency: "USD",
                            },
                        ])
                    ),
                    chunkSize
                );

                for (const chunk of priceChunks) {
                    await tx
                        .insert(price)
                        .values(chunk as Price[])
                        .onConflictDoNothing({
                            target: [price.id_token, price.date],
                        });
                }
                console.log(`Inserted ${priceChunks.length} price records`);
            });

            return pairData.slice(-10);
        });
    },
);
