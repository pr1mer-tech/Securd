"use client";

import { useMarkets } from "@/lib/hooks/useMarkets";
import { formatUSD } from "@/lib/helpers/market.helpers";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Protocol-wide aggregate stats — Total Market Size and Total Borrowed across
 * every listed market, derived client-side from data already in the store
 * (no extra contract reads). Rendered unconditionally, independent of wallet
 * connection: unlike AccountSummary (which is per-user and gated on a
 * connected wallet), this is public market information and should be visible
 * to any visitor, same as it would be on Compound's markets page.
 */
export function ProtocolStats() {
  const { markets, isLoading } = useMarkets();

  const totalMarketSizeUSD = markets.reduce((acc, m) => acc + m.totalSupplyUSD, 0);
  const totalBorrowedUSD = markets.reduce((acc, m) => acc + m.totalBorrowsUSD, 0);

  return (
    <div className="bg-white/[0.03] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {isLoading ? (
          <ProtocolStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Market Size" value={formatUSD(totalMarketSizeUSD)} />
            <StatCard label="Total Borrowed" value={formatUSD(totalBorrowedUSD)} />
            <StatCard label="Markets" value={`${markets.length}`} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-securdGrey text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="font-poppins text-2xl font-bold text-securdWhite tabular-nums">
        {value}
      </span>
    </div>
  );
}

function ProtocolStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-7 w-28 bg-white/10" />
        </div>
      ))}
    </div>
  );
}
