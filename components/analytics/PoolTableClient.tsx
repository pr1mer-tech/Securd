"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../layout/DataTable";
import { Tabs } from "../ui/tabs";
import SecurdFormat from "../utils/SecurdFormat";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import PercentageFormat from "../utils/PercentageFormat";
import PairIcon from "../farm/PairIcon";
import { ReserveInfo } from "@/lib/types/save.types";
import { PoolTableRows, analyticsToCollateralInfo, tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import { ColorCircle } from "../farm/AccountCard";
import MrmScore from "./score";

const columns: ColumnDef<PoolTableRows>[] = [
    {
        id: "pool",
        accessorFn: (row: PoolTableRows) => row.pool?.token_0?.token_symbol + "/" + row.pool?.token_1?.token_symbol,
        header: "Pool",
        cell: ({ row }) => {
            const userCollateralInfo = analyticsToCollateralInfo(row.original.pool, row.original);

            return <div className="w-full text-left">
                <PairIcon userCollateralsInfo={userCollateralInfo} reservesInfo={row.original.pool?.reservesInfo} symbol={true} size="normal" />
            </div>
        }
    },
    {
        id: "tvl",
        accessorFn: (row: PoolTableRows) => (row.volume_token_0 ?? 0) + (row.volume_token_1 ?? 0),
        header: "TVL",
        cell: ({ row }) => <div className="w-full text-left">
            <SecurdFormat value={row.getValue("tvl")} />
        </div>
    },
    {
        id: "score",
        accessorFn: (row: PoolTableRows) => row.mrm,
        header: "Score",
        cell: ({ row }) => <MrmScore score={row.getValue("score")} />
    },
    {
        id: "apy",
        accessorFn: (row: PoolTableRows) => row.lp_apy_1m,
        header: "APY",
        cell: ({ row }) => <div className="w-full text-left">
            <PercentageFormat value={row.getValue("apy")} />
        </div>
    }
]

export default function PoolsTableClient({ data }: { data: PoolTableRows[] }) {
    return <Tabs defaultValue="table" className="text-xl font-bold">
        <DataTable
            columns={columns}
            data={data}
            linkFn={(row) => `/analytics/${row.id_pool}`}
        />
    </Tabs>
}
