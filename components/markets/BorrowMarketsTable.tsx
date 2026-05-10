"use client";

import { useState } from "react";
import { useMarkets } from "@/lib/hooks/useMarkets";
import { useUserAccount } from "@/lib/hooks/useUserAccount";
import { MarketAssetIcon } from "./MarketAssetIcon";
import { BorrowModal } from "./BorrowModal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSD, formatAPY } from "@/lib/helpers/market.helpers";
import type { MarketData, UserMarketPosition } from "@/lib/types/market.types";
import type { Address } from "viem";

export function BorrowMarketsTable() {
  const { markets, isLoading } = useMarkets();
  const { userAccount } = useUserAccount();
  const [modalMarket, setModalMarket] = useState<{
    market: MarketData;
    defaultAction: "borrow" | "repay";
  } | null>(null);

  const userPositions = new Map<Address, UserMarketPosition>(
    userAccount?.positions.map((p) => [p.cToken, p]) ?? [],
  );

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-poppins font-bold text-securdWhite text-lg">
            Borrow Markets
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-securdGrey text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Asset</th>
                <th className="text-right px-4 py-3 font-medium">APY</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">
                  Available
                </th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                  Utilization
                </th>
                <th className="text-right px-6 py-3 font-medium">Borrowed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <BorrowRowSkeleton key={i} />
                  ))
                : markets.map((market) => (
                    <BorrowRow
                      key={market.cToken}
                      market={market}
                      position={userPositions.get(market.cToken)}
                      onBorrow={() =>
                        setModalMarket({ market, defaultAction: "borrow" })
                      }
                      onRepay={() =>
                        setModalMarket({ market, defaultAction: "repay" })
                      }
                    />
                  ))}
              {!isLoading && markets.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-securdGrey text-sm"
                  >
                    No markets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMarket && (
        <BorrowModal
          market={modalMarket.market}
          position={userPositions.get(modalMarket.market.cToken)}
          userAccount={userAccount}
          defaultAction={modalMarket.defaultAction}
          onClose={() => setModalMarket(null)}
        />
      )}
    </>
  );
}

function BorrowRow({
  market,
  position,
  onBorrow,
  onRepay,
}: {
  market: MarketData;
  position?: UserMarketPosition;
  onBorrow: () => void;
  onRepay: () => void;
}) {
  const borrowed = position?.borrowBalanceUSD ?? 0;
  const hasPosition = borrowed > 0;

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
      {/* Asset */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <MarketAssetIcon symbol={market.underlyingSymbol} size="md" />
          <div className="flex flex-col">
            <span className="text-securdWhite font-medium text-sm">
              {market.underlyingSymbol}
            </span>
            <span className="text-securdGrey text-xs">{market.name}</span>
          </div>
        </div>
      </td>

      {/* APY */}
      <td className="px-4 py-4 text-right">
        <span className="text-systemRed font-bold text-sm tabular-nums">
          {formatAPY(market.borrowAPY)}
        </span>
      </td>

      {/* Available liquidity */}
      <td className="px-4 py-4 text-right hidden md:table-cell">
        <span className="text-securdWhite text-sm tabular-nums">
          {formatUSD(market.availableLiquidityUSD)}
        </span>
      </td>

      {/* Utilization bar */}
      <td className="px-4 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-securdPrimaryLight transition-all"
              style={{ width: `${Math.min(market.utilization, 100)}%` }}
            />
          </div>
          <span className="text-securdGrey text-xs tabular-nums w-9 text-right">
            {market.utilization.toFixed(0)}%
          </span>
        </div>
      </td>

      {/* Borrowed */}
      <td className="px-6 py-4 text-right">
        {hasPosition ? (
          <span className="text-securdWhite font-medium text-sm tabular-nums">
            {formatUSD(borrowed)}
          </span>
        ) : (
          <span className="text-securdGrey text-sm">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasPosition && (
            <button
              onClick={onRepay}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/20 text-securdWhite hover:bg-white/10 transition-colors"
            >
              Repay
            </button>
          )}
          <button
            onClick={onBorrow}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-securdPrimary text-securdWhite hover:bg-securdPrimary/80 transition-colors"
          >
            Borrow
          </button>
        </div>
      </td>
    </tr>
  );
}

function BorrowRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full bg-white/10" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-10 bg-white/10" />
            <Skeleton className="h-2.5 w-16 bg-white/10" />
          </div>
        </div>
      </td>
      {[0, 1, 2, 3].map((i) => (
        <td key={i} className="px-4 py-4 text-right">
          <Skeleton className="h-3.5 w-14 bg-white/10 ml-auto" />
        </td>
      ))}
      <td className="px-4 py-4" />
    </tr>
  );
}
