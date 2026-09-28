"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplyMarketsTable } from "./SupplyMarketsTable";
import { BorrowMarketsTable } from "./BorrowMarketsTable";
import { AdvancedStrategiesPanel } from "@/components/strategies/AdvancedStrategiesPanel";
import { MAINNET_FEATURES_ENABLED } from "@/lib/constants/network";

export function MarketsTabs() {
  if (!MAINNET_FEATURES_ENABLED) {
    return (
      <div className="flex flex-col gap-6">
        <SupplyMarketsTable />
        <BorrowMarketsTable />
      </div>
    );
  }

  return (
    <Tabs defaultValue="markets" className="flex flex-col gap-6">
      <TabsList className="self-start h-11 rounded-xl bg-white/5 border border-white/10 p-1">
        <TabsTrigger
          value="markets"
          className="h-9 rounded-lg px-4 text-sm font-bold text-securdGrey data-[state=active]:bg-securdPrimary data-[state=active]:text-securdWhite"
        >
          Simple
        </TabsTrigger>
        <TabsTrigger
          value="strategies"
          className="h-9 rounded-lg px-4 text-sm font-bold text-securdGrey data-[state=active]:bg-securdPrimary data-[state=active]:text-securdWhite"
        >
          Advanced
        </TabsTrigger>
      </TabsList>

      <TabsContent value="markets" className="mt-0 flex flex-col gap-6">
        <SupplyMarketsTable />
        <BorrowMarketsTable />
      </TabsContent>

      <TabsContent value="strategies" className="mt-0">
        <AdvancedStrategiesPanel />
      </TabsContent>
    </Tabs>
  );
}
