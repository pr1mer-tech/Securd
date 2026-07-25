"use client";

import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { comptrollerContract } from "@/lib/constants/contracts";
import type { MarketData, UserAccount } from "@/lib/types/market.types";

type HypotheticalAction = "borrow" | "withdraw";

type HypotheticalLiquidity = {
  isLoading: boolean;
  isExact: boolean;
  isBlocked: boolean;
  reason?: string;
  borrowLimitUSD?: number;
  borrowLimitUsed?: number;
  healthFactor?: number;
  liquidityUSD?: number;
  shortfallUSD?: number;
};

const CTOKEN_MANTISSA = 10n ** 18n;

function bigintToUSD(value: bigint): number {
  return Number(value) / 1e18;
}

function parseInputToEvmWei(value: string, decimals: number): bigint {
  const clean = value.trim();
  if (!clean || Number(clean) <= 0) return 0n;
  return parseUnits(clean, decimals);
}

function underlyingToRedeemTokens(amountWei: bigint, exchangeRate: bigint): bigint {
  if (amountWei <= 0n || exchangeRate <= 0n) return 0n;
  return (amountWei * CTOKEN_MANTISSA) / exchangeRate;
}

export function useHypotheticalLiquidity(params: {
  action: HypotheticalAction;
  amount: string;
  market: MarketData;
  userAccount?: UserAccount | null;
  enabled?: boolean;
}): HypotheticalLiquidity {
  const { action, amount, market, userAccount, enabled = true } = params;
  const inputUSD = useMemo(() => {
    const n = Number(amount || "0");
    return Number.isFinite(n) && n > 0 ? n * market.priceUSD : 0;
  }, [amount, market.priceUSD]);

  const [state, setState] = useState<HypotheticalLiquidity>({
    isLoading: false,
    isExact: false,
    isBlocked: false,
  });

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      if (!enabled || !userAccount || inputUSD <= 0) {
        setState({ isLoading: false, isExact: false, isBlocked: false });
        return;
      }

      let amountWei: bigint;
      try {
        amountWei = parseInputToEvmWei(amount, market.underlyingDecimals);
      } catch {
        setState({
          isLoading: false,
          isExact: false,
          isBlocked: true,
          reason: "Invalid amount",
        });
        return;
      }

      const borrowAmount = action === "borrow" ? amountWei : 0n;
      const redeemTokens =
        action === "withdraw"
          ? underlyingToRedeemTokens(amountWei, market.exchangeRate)
          : 0n;

      if (borrowAmount === 0n && redeemTokens === 0n) {
        setState({ isLoading: false, isExact: false, isBlocked: false });
        return;
      }

      setState((current) => ({ ...current, isLoading: true }));

      try {
        const [error, liquidity, shortfall] = await xrplEvmClient.readContract({
          ...comptrollerContract,
          functionName: "getHypotheticalAccountLiquidity",
          args: [userAccount.proxyAddress, market.cToken, redeemTokens, borrowAmount],
        });

        if (cancelled) return;

        if (error !== 0n) {
          setState({
            isLoading: false,
            isExact: false,
            isBlocked: true,
            reason: "Unable to preview on-chain impact",
          });
          return;
        }

        const liquidityUSD = bigintToUSD(liquidity);
        const shortfallUSD = bigintToUSD(shortfall);
        const projectedBorrowUSD =
          action === "borrow"
            ? userAccount.totalBorrowUSD + inputUSD
            : userAccount.totalBorrowUSD;
        const borrowLimitUSD = Math.max(
          0,
          projectedBorrowUSD + liquidityUSD - shortfallUSD,
        );
        const borrowLimitUsed =
          borrowLimitUSD > 0 ? projectedBorrowUSD / borrowLimitUSD : 0;
        const healthFactor =
          projectedBorrowUSD > 0 && borrowLimitUSD > 0
            ? borrowLimitUSD / projectedBorrowUSD
            : Infinity;

        setState({
          isLoading: false,
          isExact: true,
          isBlocked: shortfall > 0n,
          reason: shortfall > 0n ? "This action would create a shortfall" : undefined,
          borrowLimitUSD,
          borrowLimitUsed,
          healthFactor,
          liquidityUSD,
          shortfallUSD,
        });
      } catch {
        if (!cancelled) {
          setState({
            isLoading: false,
            isExact: false,
            isBlocked: true,
            reason: "Unable to preview on-chain impact",
          });
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [
    action,
    amount,
    enabled,
    inputUSD,
    market.cToken,
    market.exchangeRate,
    market.underlyingDecimals,
    userAccount,
  ]);

  return state;
}
