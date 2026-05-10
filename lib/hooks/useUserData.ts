"use client";

import { useCallback, useEffect } from "react";
import { useAccount } from "@hyper-gate/react";
import type { Address } from "viem";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { comptrollerContract, cTokenContract } from "@/lib/constants/contracts";
import { useMarketsStore } from "@/lib/data/marketsStore";
import { getProxyAddress } from "@/lib/utils/xrplProxy";
import { cTokenToUnderlying, toUSD } from "@/lib/helpers/market.helpers";
import type {
  UserAccount,
  UserMarketPosition,
  AccountLiquidity,
} from "@/lib/types/market.types";

export function useUserData() {
  const { address: xrplAddress } = useAccount();
  const markets = useMarketsStore((s) => s.markets);
  const setUserAccount = useMarketsStore((s) => s.setUserAccount);
  const setUserLoading = useMarketsStore((s) => s.setUserLoading);

  const refresh = useCallback(async () => {
    if (!xrplAddress || markets.length === 0) {
      setUserAccount(null);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);

    try {
      const proxyAddress = await getProxyAddress(xrplAddress);

      const allResults = await Promise.all([
        xrplEvmClient.readContract({
          ...comptrollerContract,
          functionName: "getAssetsIn",
          args: [proxyAddress],
        }),
        xrplEvmClient.readContract({
          ...comptrollerContract,
          functionName: "getAccountLiquidity",
          args: [proxyAddress],
        }),
        ...markets.map((m) =>
          xrplEvmClient.readContract({
            ...cTokenContract(m.cToken),
            functionName: "getAccountSnapshot",
            args: [proxyAddress],
          }),
        ),
      ]);

      const assetsIn = allResults[0] as readonly Address[];
      const liq = allResults[1] as [bigint, bigint, bigint];
      const liquidity = liq[1];
      const shortfall = liq[2];
      const snapshots = allResults.slice(2) as ([bigint, bigint, bigint, bigint] | undefined)[];

      const accountLiquidity: AccountLiquidity = {
        error: 0n,
        liquidity,
        shortfall,
      };

      const positions: UserMarketPosition[] = markets.map((m, i) => {
        const snapshot = snapshots[i] ?? ([0n, 0n, 0n, 0n] as [bigint, bigint, bigint, bigint]);
        const [, cTokenBalance, borrowBalance, exchangeRate] = snapshot;
        const isCollateral = assetsIn.some(
          (a) => a.toLowerCase() === m.cToken.toLowerCase(),
        );
        const supplyBalanceUnderlying = cTokenToUnderlying(cTokenBalance, exchangeRate);
        const supplyBalanceUSD = toUSD(supplyBalanceUnderlying, m.underlyingDecimals, m.priceUSD);
        const borrowBalanceUSD = toUSD(borrowBalance, m.underlyingDecimals, m.priceUSD);

        return {
          cToken: m.cToken,
          cTokenBalance,
          borrowBalance,
          supplyBalanceUnderlying,
          supplyBalanceUSD,
          borrowBalanceUSD,
          isCollateral,
        };
      });

      const totalSupplyUSD = positions.reduce((acc, p) => acc + p.supplyBalanceUSD, 0);
      const totalBorrowUSD = positions.reduce((acc, p) => acc + p.borrowBalanceUSD, 0);

      // Borrow limit = sum of (supplyUSD * collateralFactor) for collateral markets
      const borrowLimitUSD = positions.reduce((acc, p, i) => {
        if (!p.isCollateral) return acc;
        const market = markets[i];
        if (!market) return acc;
        const cf = Number(market.collateralFactor) / 1e18;
        return acc + p.supplyBalanceUSD * cf;
      }, 0);

      const borrowLimitUsed =
        borrowLimitUSD > 0 ? (totalBorrowUSD / borrowLimitUSD) * 100 : 0;

      const healthFactor =
        totalBorrowUSD === 0 ? Infinity : borrowLimitUSD / totalBorrowUSD;

      // Net APY: (supply_income - borrow_cost) / totalSupplyUSD
      let netAPY = 0;
      if (totalSupplyUSD > 0) {
        const supplyIncome = positions.reduce(
          (acc, p, i) => acc + p.supplyBalanceUSD * (markets[i]?.supplyAPY ?? 0),
          0,
        );
        const borrowCost = positions.reduce(
          (acc, p, i) => acc + p.borrowBalanceUSD * (markets[i]?.borrowAPY ?? 0),
          0,
        );
        netAPY = (supplyIncome - borrowCost) / totalSupplyUSD;
      }

      const userAccount: UserAccount = {
        xrplAddress,
        proxyAddress,
        totalSupplyUSD,
        totalBorrowUSD,
        netAPY,
        borrowLimitUSD,
        borrowLimitUsed,
        healthFactor,
        positions,
        liquidity: accountLiquidity,
      };

      setUserAccount(userAccount);
    } catch (err) {
      console.error("[useUserData]", err);
      setUserLoading(false);
    }
  }, [xrplAddress, markets, setUserAccount, setUserLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);
}
