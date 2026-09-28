"use client";

import { useState } from "react";
import { useUserAccount } from "@/lib/hooks/useUserAccount";
import { useXrplBalance } from "@/lib/hooks/useXrplBalance";
import { SupplyModal } from "@/components/markets/SupplyModal";
import { BorrowModal } from "@/components/markets/BorrowModal";
import {
  formatUSD,
  formatAPY,
  formatTokenAmount,
  mantissaToPercent,
} from "@/lib/helpers/market.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

export function UserPosition({ market }: Props) {
  const { userAccount, isLoading } = useUserAccount();
  const { getWalletBalance } = useXrplBalance();
  const [supplyModal, setSupplyModal] = useState<"supply" | "withdraw" | null>(null);
  const [borrowModal, setBorrowModal] = useState<"borrow" | "repay" | null>(null);
  const position = userAccount?.positions.find(
    (p) => p.cToken.toLowerCase() === market.cToken.toLowerCase(),
  );
  const hasSupply = (position?.supplyBalanceUSD ?? 0) > 0;
  const isCollateral = position?.isCollateral ?? false;
  const collateralFactorPct = mantissaToPercent(market.collateralFactor);
  const collateralContributionUSD =
    isCollateral
      ? (position?.supplyBalanceUSD ?? 0) * (collateralFactorPct / 100)
      : 0;
  const suppliedUnderlying =
    Number(position?.supplyBalanceUnderlying ?? 0n) / 10 ** market.underlyingDecimals;
  const cTokenBalance = Number(position?.cTokenBalance ?? 0n) / 10 ** market.cTokenDecimals;
  const withdrawCapacityUSD = calculateWithdrawCapacityUSD({
    isCollateral,
    supplyBalanceUSD: position?.supplyBalanceUSD ?? 0,
    userLiquidityUSD: Number(userAccount?.liquidity.liquidity ?? 0n) / 1e18,
    collateralFactorPct,
  });
  const borrowCapacityUnderlying = calculateBorrowCapacityUnderlying({
    market,
    userLiquidityUSD: Number(userAccount?.liquidity.liquidity ?? 0n) / 1e18,
  });

  if (isLoading) {
    return <PositionSkeleton />;
  }

  if (!userAccount) {
    return (
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 text-center">
        <p className="text-securdGrey text-sm">
          Connect your XRPL wallet to see your position
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
        <h3 className="font-poppins font-bold text-securdWhite">Your Position</h3>

        {/* Supply panel */}
        <div className="flex flex-col gap-3">
          <p className="text-securdGrey text-xs uppercase tracking-wider">Supplied</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-securdWhite font-bold text-lg tabular-nums">
                {formatUSD(position?.supplyBalanceUSD ?? 0)}
              </span>
              <span className={isCollateral ? "text-systemGreen text-xs" : "text-securdGrey text-xs"}>
                {formatAPY(market.supplyAPY)} APY · {isCollateral ? "Collateral on" : "Collateral off"}
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {hasSupply && (
                <button
                  disabled
                  title="Collateral toggle coming soon — requires a direct EVM interaction not yet supported"
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-white/20 text-securdWhite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCollateral ? "Exit" : "Collateral"}
                </button>
              )}
              {hasSupply && (
                <button
                  onClick={() => setSupplyModal("withdraw")}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-white/20 text-securdWhite hover:bg-white/10 transition-colors"
                >
                  Withdraw
                </button>
              )}
              <button
                onClick={() => setSupplyModal("supply")}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-securdPrimary text-securdWhite hover:bg-securdPrimary/80 transition-colors"
              >
                Supply
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Market impact panel */}
        <div className="flex flex-col gap-3">
          <p className="text-securdGrey text-xs uppercase tracking-wider">
            Market Impact
          </p>
          <div className="flex flex-col divide-y divide-white/10 rounded-xl bg-white/[0.03] border border-white/10 px-4">
            <PositionMetric
              label={`${market.symbol} Balance`}
              value={`${formatTokenAmount(cTokenBalance, 6)} ${market.symbol}`}
            />
            <PositionMetric
              label="Underlying Supplied"
              value={`${formatTokenAmount(suppliedUnderlying, 6)} ${market.underlyingSymbol}`}
            />
            <PositionMetric
              label="Collateral Contribution"
              value={formatUSD(collateralContributionUSD)}
            />
            <PositionMetric
              label="Est. Withdraw Capacity"
              value={formatUSD(withdrawCapacityUSD)}
            />
            <PositionMetric
              label="Est. Borrow Capacity"
              value={`${formatTokenAmount(borrowCapacityUnderlying, 4)} ${market.underlyingSymbol}`}
            />
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Borrow panel */}
        <div className="flex flex-col gap-3">
          <p className="text-securdGrey text-xs uppercase tracking-wider">Borrowed</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-securdWhite font-bold text-lg tabular-nums">
                {formatUSD(position?.borrowBalanceUSD ?? 0)}
              </span>
              <span className="text-systemRed text-xs">
                {formatAPY(market.borrowAPY)} APY
              </span>
            </div>
            <div className="flex gap-2">
              {(position?.borrowBalanceUSD ?? 0) > 0 && (
                <button
                  onClick={() => setBorrowModal("repay")}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-white/20 text-securdWhite hover:bg-white/10 transition-colors"
                >
                  Repay
                </button>
              )}
              <button
                onClick={() => setBorrowModal("borrow")}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-securdPrimary text-securdWhite hover:bg-securdPrimary/80 transition-colors"
              >
                Borrow
              </button>
            </div>
          </div>
        </div>
      </div>

      {supplyModal && (
        <SupplyModal
          market={market}
          position={position}
          defaultAction={supplyModal}
          userAccount={userAccount}
          walletBalance={getWalletBalance(market)}
          onClose={() => setSupplyModal(null)}
        />
      )}
      {borrowModal && (
        <BorrowModal
          market={market}
          position={position}
          userAccount={userAccount}
          defaultAction={borrowModal}
          walletBalance={getWalletBalance(market)}
          onClose={() => setBorrowModal(null)}
        />
      )}
    </>
  );
}

function PositionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-securdGrey text-sm">{label}</span>
      <span className="text-sm font-medium text-securdWhite text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}

function calculateWithdrawCapacityUSD({
  isCollateral,
  supplyBalanceUSD,
  userLiquidityUSD,
  collateralFactorPct,
}: {
  isCollateral: boolean;
  supplyBalanceUSD: number;
  userLiquidityUSD: number;
  collateralFactorPct: number;
}): number {
  if (supplyBalanceUSD <= 0) return 0;
  if (!isCollateral) return supplyBalanceUSD;
  if (collateralFactorPct <= 0) return 0;
  return Math.max(0, Math.min(supplyBalanceUSD, userLiquidityUSD / (collateralFactorPct / 100)));
}

function calculateBorrowCapacityUnderlying({
  market,
  userLiquidityUSD,
}: {
  market: MarketData;
  userLiquidityUSD: number;
}): number {
  if (!market.isListed || market.borrowGuardianPaused || market.priceUSD <= 0) return 0;
  const accountCapacity = Math.max(0, userLiquidityUSD / market.priceUSD);
  const liquidityCapacity = Number(market.totalCash) / 10 ** market.underlyingDecimals;

  if (market.borrowCap === 0n) {
    return Math.min(accountCapacity, liquidityCapacity);
  }

  const cap = Number(market.borrowCap) / 10 ** market.underlyingDecimals;
  const borrowed = Number(market.totalBorrows) / 10 ** market.underlyingDecimals;
  const remainingCap = Math.max(0, cap - borrowed);

  return Math.min(accountCapacity, liquidityCapacity, remainingCap);
}

function PositionSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 flex flex-col gap-5">
      <Skeleton className="h-4 w-28 bg-white/10" />
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="h-7 w-24 bg-white/10" />
        </div>
      ))}
    </div>
  );
}
