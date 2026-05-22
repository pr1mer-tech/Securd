"use client";

import { useAccount, useWallet } from "@/lib/xrpl/walletContext";
import { useUserAccount } from "@/lib/hooks/useUserAccount";
import { formatUSD, formatAPY } from "@/lib/helpers/market.helpers";
import { HealthFactor } from "./HealthFactor";
import { BorrowLimitBar } from "./BorrowLimitBar";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountSummary() {
  const { address } = useAccount();
  const { openPicker } = useWallet();
  const { userAccount, isLoading } = useUserAccount();

  return (
    <div className="bg-securdPrimary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {!address ? (
          <DisconnectedState onConnect={openPicker} />
        ) : isLoading || !userAccount ? (
          <AccountSummarySkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Top row — three stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Net APY"
                value={formatAPY(userAccount.netAPY)}
                valueClass={
                  userAccount.netAPY >= 0 ? "text-systemGreen" : "text-systemRed"
                }
              />
              <StatCard
                label="Supply Balance"
                value={formatUSD(userAccount.totalSupplyUSD)}
              />
              <StatCard
                label="Borrow Balance"
                value={formatUSD(userAccount.totalBorrowUSD)}
              />
            </div>

            {/* Bottom row — borrow limit bar + health factor */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
              <div className="flex-1">
                <BorrowLimitBar
                  used={userAccount.borrowLimitUsed}
                  limitUSD={userAccount.borrowLimitUSD}
                />
              </div>
              <HealthFactor value={userAccount.healthFactor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisconnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-poppins text-xl font-bold text-securdWhite">
          Connect your wallet
        </span>
        <span className="text-securdPrimaryLight text-sm">
          Connect your XRPL wallet to view your positions and start earning.
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-securdWhite",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-securdPrimaryLight text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className={`font-poppins text-3xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function AccountSummarySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="h-9 w-32 bg-white/20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-full bg-white/20" />
    </div>
  );
}
