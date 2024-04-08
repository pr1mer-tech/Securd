"use client";

import { Card } from "@/components/ui/card";
import { MenuTabsContent } from "@/components/ui/menu-tabs";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import { PoolDetails, PoolTableRows } from "@/lib/helpers/analytics.helper";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import { AreaChart, Color } from '@tremor/react';


const dataFormatter = (number: number) =>
    `$${securdFormat(number, 2)}`;


export default function Graphs({ poolInfo, className }: { poolInfo: PoolDetails, className?: string }) {
    const timeRange = useAnalyticsAddressStore.use.timeRange();
    // Compute date from timeRange
    const limitDate = new Date();
    switch (timeRange) {
        case "1m":
            limitDate.setMonth(limitDate.getMonth() - 1);
            break;
        case "3m":
            limitDate.setMonth(limitDate.getMonth() - 3);
            break;
        case "1y":
            limitDate.setFullYear(limitDate.getFullYear() - 1);
            break;
    }

    return <Card className="w-full pl-1 pr-4">
        <MenuTabsContent value="pool">
            <AreaChart
                className="h-60"
                colors={[
                    "#E8A029",
                ]}
                data={poolInfo?.token_0?.prices?.filter((price) => price.date && price.date >= limitDate)
                    .map((info) => ({
                        date: info.date?.toDateString(),
                        "Price in USD": info.price
                    })).toReversed() ?? []}
                index="date"
                categories={["Price in USD"]}
                valueFormatter={dataFormatter}
                yAxisWidth={90}
            />
            <AreaChart
                className="h-60"
                data={poolInfo?.analytics?.filter((info) => info.date && info.date >= limitDate)
                    .map((info) => ({
                        date: info.date?.toDateString(),
                        Volume: (info.volume_token_0 ?? 0) + (info.volume_token_1 ?? 0)
                    })).toReversed() ?? []}
                colors={[
                    "#0B4B48",
                ]}
                index="date"
                categories={["Volume"]}
                valueFormatter={dataFormatter}
                yAxisWidth={90}
            />
        </MenuTabsContent>
        <MenuTabsContent value="apy">
            <AreaChart
                className="h-60"
                colors={[
                    "#0B4B48",
                    "#E95A4C"
                ]}
                data={poolInfo?.analytics?.filter((info) => info.date && info.date >= limitDate)
                    .reduce((acc, info) => {
                        const price = poolInfo.token_0?.prices?.find((price) => price.date?.toDateString() === info.date?.toDateString())?.price;
                        const quantity = 100 / (poolInfo.token_0?.prices?.[0].price ?? 0);
                        acc.push({
                            date: info.date?.toDateString() ?? "",
                            LP: acc[acc.length - 1]?.LP ?? 0 * (1 + (info.lp_apy_1d ?? 0) / 100),
                            HODL: price ? quantity * price : 0
                        });
                        return acc;
                    }, [] as {
                        date: string;
                        LP: number;
                        HODL: number;
                    }[]).toReversed() ?? []}
                index="date"
                categories={['LP', 'HODL']}
                valueFormatter={dataFormatter}
                yAxisWidth={90}
            />
            <AreaChart
                className="h-60"
                colors={[
                    "#E95A4C",
                    "#0B4B48",
                    "#E8A029"
                ]}
                data={poolInfo?.analytics?.filter((info) => info.date && info.date >= limitDate)
                    .map((info) => ({
                        date: info.date?.toDateString(),
                        Fee: info.fee_apy_1d,
                        IL: info.il_apy_1d,
                        Interest: info.lp_apy_1d,
                    })).toReversed() ?? []}
                index="date"
                categories={["Fee", "IL", "Interest"]}
                valueFormatter={dataFormatter}
                yAxisWidth={90}
            />
        </MenuTabsContent>
    </Card>
}