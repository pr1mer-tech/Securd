"use client";

import { useState } from "react";
import { useMarkets } from "@/lib/hooks/useMarkets";
import { useUserAccount } from "@/lib/hooks/useUserAccount";
import { useXrplBalance } from "@/lib/hooks/useXrplBalance";
import { MarketAssetIcon } from "./MarketAssetIcon";
import { SupplyModal } from "./SupplyModal";
import { TxStatusModal } from "./TxStatusModal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUSD, formatAPY, formatTokenAmount } from "@/lib/helpers/market.helpers";
import { useSubmitIntent, ACTION_TYPE, marketIou } from "@/lib/xrpl/useSubmitIntent";
import { useExitMarketGuard } from "@/lib/hooks/useExitMarketGuard";
import type { MarketData, UserAccount, UserMarketPosition } from "@/lib/types/market.types";

export function SupplyMarketsTable() {
  const { markets, isLoading } = useMarkets();
  const { userAccount } = useUserAccount();
  const { getWalletBalance } = useXrplBalance();
  const [modalMarket, setModalMarket] = useState<{
    market: MarketData;
    defaultAction: "supply" | "withdraw";
  } | null>(null);

  const userPositions = new Map<string, UserMarketPosition>(
    userAccount?.positions.map((p) => [p.cToken.toLowerCase(), p]) ?? [],
  );

  return (
    <>
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-poppins font-bold text-securdWhite text-lg">
            Supply Markets
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-securdGrey text-xs uppercase tracking-wider border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Asset</th>
                <th className="text-right px-4 py-3 font-medium">APY</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">
                  Total Supply
                </th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                  Wallet
                </th>
                <th className="text-right px-6 py-3 font-medium">Supplied</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <SupplyRowSkeleton key={i} />
                ))
                : markets.map((market) => (
                  <SupplyRow
                    key={market.cToken}
                    market={market}
                    position={userPositions.get(market.cToken.toLowerCase())}
                    userAccount={userAccount}
                    walletBalance={getWalletBalance(market)}
                    onSupply={() =>
                      setModalMarket({ market, defaultAction: "supply" })
                    }
                    onWithdraw={() =>
                      setModalMarket({ market, defaultAction: "withdraw" })
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
        <SupplyModal
          market={modalMarket.market}
          position={userPositions.get(modalMarket.market.cToken.toLowerCase())}
          defaultAction={modalMarket.defaultAction}
          userAccount={userAccount}
          walletBalance={getWalletBalance(modalMarket.market)}
          onClose={() => setModalMarket(null)}
        />
      )}
    </>
  );
}

function SupplyRow({
  market,
  position,
  userAccount,
  walletBalance,
  onSupply,
  onWithdraw,
}: {
  market: MarketData;
  position?: UserMarketPosition;
  userAccount?: UserAccount | null;
  walletBalance: number | null;
  onSupply: () => void;
  onWithdraw: () => void;
}) {
  const suppliedUSD = position?.supplyBalanceUSD ?? 0;
  const suppliedUnderlying = position
    ? Number(position.supplyBalanceUnderlying) / 10 ** market.underlyingDecimals
    : 0;
  const hasPosition = (position?.cTokenBalance ?? 0n) > 0n;
  const isCollateral = position?.isCollateral ?? false;
  const { submit, state, reset, isBlocked } = useSubmitIntent();
  const exitGuard = useExitMarketGuard(market, position, userAccount);
  const isPending = state.status === "signing" || state.status === "submitting";
  const collateralActionLabel = isCollateral
    ? `Exit ${market.underlyingSymbol} collateral`
    : `Enter ${market.underlyingSymbol} collateral`;
  const isCollateralActionDisabled =
    isPending || isBlocked || exitGuard.isChecking || (isCollateral && exitGuard.isBlocked);

  const submitCollateralToggle = () => {
    if (isCollateralActionDisabled) return;
    void submit({
      market: market.cToken,
      underlying: market.underlying,
      actionType: isCollateral ? ACTION_TYPE.EXIT_MARKET : ACTION_TYPE.ENTER_MARKET,
      underlyingDecimals: market.underlyingDecimals,
      iou: marketIou(market),
    });
  };

  return (
    <>
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
          <span className="text-systemGreen font-bold text-sm tabular-nums">
            {formatAPY(market.supplyAPY)}
          </span>
        </td>

        {/* Total Supply */}
        <td className="px-4 py-4 text-right hidden md:table-cell">
          <div className="flex flex-col items-end gap-1">
            <span className="text-securdWhite text-sm tabular-nums">
              {formatTokenAmount(market.totalSupplyUnderlying)} {market.underlyingSymbol}
            </span>
            <span className="text-securdGrey text-xs tabular-nums">
              {formatUSD(market.totalSupplyUSD)}
            </span>
          </div>
        </td>

        {/* Wallet balance */}
        <td className="px-4 py-4 text-right hidden lg:table-cell">
          {walletBalance !== null ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-securdWhite text-sm tabular-nums">
                {walletBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {market.underlyingSymbol}
              </span>
              <span className="text-securdGrey text-xs tabular-nums">
                {formatUSD(walletBalance * market.priceUSD)}
              </span>
            </div>
          ) : (
            <span className="text-securdGrey text-sm tabular-nums">—</span>
          )}
        </td>

        {/* Supplied */}
        <td className="px-6 py-4 text-right">
          {hasPosition ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-securdWhite font-medium text-sm tabular-nums">
                {suppliedUnderlying.toLocaleString(undefined, { maximumFractionDigits: 4 })} {market.underlyingSymbol}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-securdGrey text-xs tabular-nums">
                  {formatUSD(suppliedUSD)}
                </span>
                <span className="text-securdGrey text-xs">•</span>
                <span className={isCollateral ? "text-systemGreen text-xs" : "text-securdGrey text-xs"}>
                  {isCollateral ? "Collateral on" : "Collateral off"}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-securdGrey text-sm">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasPosition && (
              <button
                onClick={submitCollateralToggle}
                disabled={isCollateralActionDisabled}
                title={exitGuard.reason ?? collateralActionLabel}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/20 text-securdWhite hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending || exitGuard.isChecking ? "..." : isCollateral ? "Exit" : "Collateral"}
              </button>
            )}
            {hasPosition && (
              <button
                onClick={onWithdraw}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/20 text-securdWhite hover:bg-white/10 transition-colors"
              >
                Withdraw
              </button>
            )}
            <button
              onClick={onSupply}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-securdPrimary text-securdWhite hover:bg-securdPrimary/80 transition-colors"
            >
              Supply
            </button>
          </div>
        </td>
      </tr>
      {state.txHash && (
        <TxStatusModal
          txHash={state.txHash}
          actionLabel={collateralActionLabel}
          onClose={reset}
        />
      )}
    </>
  );
}

function SupplyRowSkeleton() {
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
