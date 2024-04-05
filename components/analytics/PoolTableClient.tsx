"use client";

import { Analytics, Blockchain, Dex, Pool, Token } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../layout/DataTable";
import { Tabs } from "../ui/tabs";

type PoolTableRows = Analytics & {
    pool: Pool & {
        blockchain: Blockchain | null;
        dex: Dex | null;
        token_0: Token | null;
        token_1: Token | null;
    } | null;
}

const columns: ColumnDef<PoolTableRows>[] = [
    {
        id: "pool",
        accessorFn: (row: PoolTableRows) => row.pool?.token_0?.token_symbol + "/" + row.pool?.token_1?.token_symbol,
        header: "Pool",
    },
    {
        id: "tvl",
        accessorFn: (row: PoolTableRows) => Number(row.volume_token_0) + Number(row.volume_token_1),
        header: "TVL",
    },
    {
        id: "score",
        accessorFn: (row: PoolTableRows) => row.liquidity_score,
        header: "Score",
    },
    {
        id: "apy",
        accessorFn: (row: PoolTableRows) => row.lp_apy_1m,
        header: "APY",
    }
]

export default async function PoolsTableClient({ data }: { data: PoolTableRows[] }) {
    return <Tabs defaultValue="table">
        <DataTable columns={columns} data={data} />
    </Tabs>
}
