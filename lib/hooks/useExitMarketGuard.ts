"use client";

import { useEffect, useState } from "react";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { comptrollerContract } from "@/lib/constants/contracts";
import type { MarketData, UserAccount, UserMarketPosition } from "@/lib/types/market.types";

type ExitMarketGuard = {
  isChecking: boolean;
  isBlocked: boolean;
  reason?: string;
};

export function useExitMarketGuard(
  market: MarketData,
  position?: UserMarketPosition,
  userAccount?: UserAccount | null,
): ExitMarketGuard {
  const [guard, setGuard] = useState<ExitMarketGuard>({
    isChecking: false,
    isBlocked: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkExitMarket() {
      if (!userAccount || !position?.isCollateral || position.cTokenBalance === 0n) {
        setGuard({ isChecking: false, isBlocked: false });
        return;
      }

      if (position.borrowBalance > 0n) {
        setGuard({
          isChecking: false,
          isBlocked: true,
          reason: "Repay this market before exiting collateral",
        });
        return;
      }

      if (userAccount.totalBorrowUSD <= 0) {
        setGuard({ isChecking: false, isBlocked: false });
        return;
      }

      setGuard((current) => ({ ...current, isChecking: true }));

      try {
        const [error, , shortfall] = await xrplEvmClient.readContract({
          ...comptrollerContract,
          functionName: "getHypotheticalAccountLiquidity",
          args: [userAccount.proxyAddress, market.cToken, position.cTokenBalance, 0n],
        });

        if (cancelled) return;

        if (error !== 0n) {
          setGuard({
            isChecking: false,
            isBlocked: true,
            reason: "Unable to verify exit safety",
          });
          return;
        }

        setGuard({
          isChecking: false,
          isBlocked: shortfall > 0n,
          reason: shortfall > 0n
            ? "Exiting this market would create a borrow shortfall"
            : undefined,
        });
      } catch {
        if (!cancelled) {
          setGuard({
            isChecking: false,
            isBlocked: true,
            reason: "Unable to verify exit safety",
          });
        }
      }
    }

    void checkExitMarket();

    return () => {
      cancelled = true;
    };
  }, [
    market.cToken,
    position?.borrowBalance,
    position?.cTokenBalance,
    position?.isCollateral,
    userAccount,
  ]);

  return guard;
}
