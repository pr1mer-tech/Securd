import Graphs from "@/components/analytics/address/Graphs";
import InfoCard from "@/components/analytics/address/InfoCard";
import QuickView from "@/components/analytics/address/QuickView";
import Rates from "@/components/analytics/address/Rates";
import { Card } from "@/components/ui/card";
import { MenuTabs, MenuTabsList, MenuTabsTrigger } from "@/components/ui/menu-tabs";
import { db } from "@/db/db";
import { pool } from "@/db/schema";
import { PoolDetails, tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import { ReserveInfo } from "@/lib/types/save.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
    const pools = await db.select({ id: pool.id_pool }).from(pool).execute();

    return pools.map((pool) => ({ params: { address: String(pool.id) } }));
}

export default async function AnalyticsAddress({ params }: { params: { address: string } }) {
    // limitDate: 7 days ago
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 365);

    const analyticsResult = await db.query.pool.findFirst({
        where: (row, { eq }) => eq(row.id_pool, Number(params.address)),
        with: {
            analytics: {
                orderBy: (row, { desc }) => [desc(row.date)],
                where: (row, { and, eq, gte }) => and(eq(row.id_pool, Number(params.address)), gte(row.date, limitDate)),
            },
            blockchain: true,
            dex: true,
            token_0: {
                with: {
                    prices: {
                        orderBy: (row, { desc }) => [desc(row.date)],
                        where: (row, { gte }) => gte(row.date, limitDate),
                    }
                }
            },
            token_1: true,
        }
    });

    const reservesInfo: ReserveInfo[] = await Promise.all([
        tokenToReserveInfo(analyticsResult?.token_0, analyticsResult?.blockchain),
        tokenToReserveInfo(analyticsResult?.token_1, analyticsResult?.blockchain)
    ]);

    const poolInfo = {
        ...analyticsResult,
        reservesInfo
    } as PoolDetails;

    return <>
        <Link href="/analytics" className="absolute left-5 top-5 text-white text-lg flex flex-row gap-2 items-center font-poppins hover:scale-110">
            <ArrowLeft className="w-6 h-6" />
            Back
        </Link>
        <div className="max-w-7xl mx-auto pt-8 px-4">
            <h1 className="font-poppins text-4xl text-white mt-8">Pool Details</h1>
            <Card className="mt-4 p-4">
                <div className="text-center flex flex-row justify-center gap-4">
                    <div className="flex flex-col basis-1/3 gap-4">
                        <InfoCard poolInfo={poolInfo} className="" />
                        <Rates poolInfo={poolInfo} className="" />
                    </div>
                    <MenuTabs defaultValue="pool" className="flex flex-col gap-4 basis-2/3">
                        <QuickView poolInfo={poolInfo} />
                        <Graphs poolInfo={poolInfo} />
                    </MenuTabs>
                </div>
            </Card>
        </div>
    </>
}