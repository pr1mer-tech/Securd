"use client";

import { Card } from "@/components/ui/card";
import { MenuTabs, MenuTabsContent, MenuTabsList, MenuTabsTrigger } from "@/components/ui/menu-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import { PoolDetails, PoolTableRows } from "@/lib/helpers/analytics.helper";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { useState } from "react";

export default function QuickView({ poolInfo, className }: { poolInfo: PoolDetails, className?: string }) {
    const timeRange = useAnalyticsAddressStore.use.timeRange();
    return <Card className="p-4">
        <div className="flex justify-between">
            <MenuTabsList className="h-[3.25rem]">
                <MenuTabsTrigger value="pool" className="p-6">Pool</MenuTabsTrigger>
                <MenuTabsTrigger value="apy" className="p-6">APY</MenuTabsTrigger>
            </MenuTabsList>

            <Tabs value={timeRange} onValueChange={(value) => useAnalyticsAddressStore.setState({ timeRange: (value as "1m" | "3m" | "1y") })}>
                <TabsList>
                    <TabsTrigger value="1m">1M</TabsTrigger>
                    <TabsTrigger value="3m">3M</TabsTrigger>
                    <TabsTrigger value="1y">1y</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <MenuTabsContent value="pool" className="flex flex-row items-center">
            <div className="flex flex-row justify-evenly items-center w-full mt-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Price {poolInfo.token_0?.token_symbol} in {poolInfo.token_1?.token_symbol}</h2>
                    <SecurdFormat value={(poolInfo.analytics?.[0].quantity_token_1 ?? 0) / (poolInfo.analytics?.[0].quantity_token_0 ?? 0)} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">TVL</h2>
                    <SecurdFormat value={(poolInfo.analytics?.[0].volume_token_0 ?? 0) + (poolInfo.analytics?.[0].volume_token_1 ?? 0)} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Volume (24h)</h2>
                    <SecurdFormat value={(poolInfo.analytics?.[0].volume_token_0 ?? 0) + (poolInfo.analytics?.[0].volume_token_1 ?? 0)} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Volume (7d)</h2>
                    <SecurdFormat value={poolInfo.analytics?.slice(0, 7)
                        .reduce((acc, curr) => acc + (curr.volume_token_0 ?? 0) + (curr.volume_token_1 ?? 0), 0)} />
                </div>
            </div>
        </MenuTabsContent>
        <MenuTabsContent value="apy" className="flex flex-row items-center">
            <div className="flex flex-row justify-evenly items-center w-full mt-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold">LP APY</h2>
                    <PercentageFormat value={poolInfo.analytics?.[0]?.[`lp_apy_${timeRange}`] ?? undefined} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">LP vs Hold APY</h2>
                    <PercentageFormat value={poolInfo.analytics?.[0]?.[`lp_vs_hold_apy_${timeRange}`] ?? undefined} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Fee APY</h2>
                    <PercentageFormat value={poolInfo.analytics?.[0]?.[`fee_apy_${timeRange}`] ?? undefined} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">IL APY</h2>
                    <PercentageFormat value={poolInfo.analytics?.[0]?.[`il_apy_${timeRange}`] ?? undefined} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Hold APY</h2>
                    <PercentageFormat value={poolInfo.analytics?.[0]?.[`hold_apy_${timeRange}`] ?? undefined} />
                </div>
            </div>
        </MenuTabsContent>
    </Card>
}
