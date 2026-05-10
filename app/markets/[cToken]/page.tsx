"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { useMarkets } from "@/lib/hooks/useMarkets";
import { MarketAssetIcon } from "@/components/markets/MarketAssetIcon";
import { MarketStats } from "@/components/markets/MarketDetail/MarketStats";
import { UtilizationChart } from "@/components/markets/MarketDetail/UtilizationChart";
import { UserPosition } from "@/components/markets/MarketDetail/UserPosition";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAPY } from "@/lib/helpers/market.helpers";
import type { Address } from "viem";

export default function MarketDetailPage() {
  const { cToken } = useParams<{ cToken: string }>();
  const { markets, isLoading } = useMarkets();

  const market = markets.find(
    (m) => m.cToken.toLowerCase() === cToken?.toLowerCase(),
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/markets"
        className="flex items-center gap-1.5 text-securdGrey hover:text-securdWhite transition-colors text-sm w-fit"
      >
        <ChevronLeftIcon size={16} />
        All Markets
      </Link>

      {isLoading || !market ? (
        <MarketDetailSkeleton />
      ) : (
        <>
          {/* Page header */}
          <div className="flex items-center gap-4">
            <MarketAssetIcon symbol={market.underlyingSymbol} size="lg" />
            <div className="flex flex-col">
              <h1 className="font-poppins font-bold text-securdWhite text-2xl">
                {market.underlyingSymbol}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-systemGreen font-medium">
                  {formatAPY(market.supplyAPY)} Supply
                </span>
                <span className="text-securdGrey">·</span>
                <span className="text-systemRed font-medium">
                  {formatAPY(market.borrowAPY)} Borrow
                </span>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: market stats + chart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <UtilizationChart market={market} />
              <MarketStats market={market} />
            </div>

            {/* Right: user position */}
            <div className="flex flex-col gap-6">
              <UserPosition market={market} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MarketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-20 bg-white/10" />
          <Skeleton className="h-4 w-36 bg-white/10" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="h-48 rounded-2xl bg-white/10" />
          <Skeleton className="h-72 rounded-2xl bg-white/10" />
        </div>
        <Skeleton className="h-64 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
