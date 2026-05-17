"use client";

import { useState } from "react";
import { useUserAccount } from "@/lib/hooks/useUserAccount";
import { SupplyModal } from "@/components/markets/SupplyModal";
import { BorrowModal } from "@/components/markets/BorrowModal";
import { formatUSD, formatAPY } from "@/lib/helpers/market.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

export function UserPosition({ market }: Props) {
  const { userAccount, isLoading } = useUserAccount();
  const [supplyModal, setSupplyModal] = useState<"supply" | "withdraw" | null>(null);
  const [borrowModal, setBorrowModal] = useState<"borrow" | "repay" | null>(null);
  const position = userAccount?.positions.find(
    (p) => p.cToken.toLowerCase() === market.cToken.toLowerCase(),
  );
  const hasSupply = (position?.supplyBalanceUSD ?? 0) > 0;
  const isCollateral = position?.isCollateral ?? false;

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
          onClose={() => setSupplyModal(null)}
        />
      )}
      {borrowModal && (
        <BorrowModal
          market={market}
          position={position}
          userAccount={userAccount}
          defaultAction={borrowModal}
          onClose={() => setBorrowModal(null)}
        />
      )}
    </>
  );
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
