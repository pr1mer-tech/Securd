import { db } from "@/db/db";
import PoolsTableClient from "./PoolTableClient";

export default async function PoolsTable() {
    const analytics = await db.query.analytics.findMany({
        with: {
            pool: {
                with: {
                    blockchain: true,
                    dex: true,
                    token_0: true,
                    token_1: true,
                }
            }
        }
    });

    return <PoolsTableClient data={analytics} />
}