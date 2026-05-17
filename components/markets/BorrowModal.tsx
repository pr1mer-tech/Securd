"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarketAssetIcon } from "./MarketAssetIcon";
import { BorrowLimitBar } from "./BorrowLimitBar";
import { HealthFactor } from "./HealthFactor";
import { formatUSD, formatAPY } from "@/lib/helpers/market.helpers";
import { useSubmitIntent, ACTION_TYPE } from "@/lib/xrpl/useSubmitIntent";
import { useHypotheticalLiquidity } from "@/lib/hooks/useHypotheticalLiquidity";
import { TxStatusModal } from "./TxStatusModal";
import type { MarketData, UserMarketPosition, UserAccount } from "@/lib/types/market.types";

type Props = {
  market: MarketData;
  position?: UserMarketPosition;
  userAccount?: UserAccount | null;
  defaultAction: "borrow" | "repay";
  onClose: () => void;
};

// Accrual buffer applied to MAX repay to cover interest that accumulates
// during the Axelar relay window (typically 2-5 minutes).
const REPAY_MAX_BUFFER = 1.005;

export function BorrowModal({ market, position, userAccount, defaultAction, onClose }: Props) {
  const [tab, setTab] = useState<"borrow" | "repay">(defaultAction);
  const [amount, setAmount] = useState("");
  const [isMaxRepay, setIsMaxRepay] = useState(false);

  const borrowedUnderlying =
    Number(position?.borrowBalance ?? 0n) / 10 ** market.underlyingDecimals;
  const borrowedUSD = position?.borrowBalanceUSD ?? 0;

  const inputAmount = parseFloat(amount || "0");
  const inputUSD = inputAmount * market.priceUSD;
  const borrowPreview = useHypotheticalLiquidity({
    action: "borrow",
    amount,
    market,
    userAccount,
    enabled: tab === "borrow" && inputAmount > 0,
  });

  const newBorrowUSD =
    tab === "borrow"
      ? (userAccount?.totalBorrowUSD ?? 0) + inputUSD
      : Math.max(0, (userAccount?.totalBorrowUSD ?? 0) - inputUSD);

  const borrowLimitUSD =
    tab === "borrow"
      ? borrowPreview.borrowLimitUSD ?? userAccount?.borrowLimitUSD ?? 0
      : userAccount?.borrowLimitUSD ?? 0;
  const newBorrowUsed =
    tab === "borrow" && borrowPreview.borrowLimitUsed !== undefined
      ? borrowPreview.borrowLimitUsed
      : borrowLimitUSD > 0 ? newBorrowUSD / borrowLimitUSD : 0;

  // Health factor approximation: (borrowLimit - newBorrow) / newBorrow
  const newHF =
    tab === "borrow" && borrowPreview.healthFactor !== undefined
      ? borrowPreview.healthFactor
      : newBorrowUSD > 0 && borrowLimitUSD > 0
        ? borrowLimitUSD / newBorrowUSD
        : Infinity;

  const maxBorrowUSD = Math.max(0, (borrowLimitUSD - (userAccount?.totalBorrowUSD ?? 0)) * 0.8);
  const maxBorrowUnderlying = market.priceUSD > 0 ? maxBorrowUSD / market.priceUSD : 0;

  const isValid = inputAmount > 0;
  const { submit, state, reset } = useSubmitIntent();
  const isPending = state.status === "signing" || state.status === "submitting";
  const borrowBlocked = tab === "borrow" && borrowPreview.isBlocked;
  const previewLabel = borrowPreview.isLoading
    ? "Checking on-chain..."
    : borrowPreview.isExact
      ? "On-chain preview"
      : "Projected preview";

  // Show Axelar tracking modal once we have a txHash
  if (state.txHash) {
    return (
      <TxStatusModal
        txHash={state.txHash}
        actionLabel={tab === "borrow" ? `Borrow ${market.underlyingSymbol}` : `Repay ${market.underlyingSymbol}`}
        onClose={() => { reset(); onClose(); }}
      />
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1a1d20] border border-white/10 text-securdWhite max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 font-poppins">
            <MarketAssetIcon symbol={market.underlyingSymbol} size="md" />
            <span>{market.underlyingSymbol}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setAmount(""); setIsMaxRepay(false); }}>
          <TabsList className="w-full rounded-none bg-white/5 border-b border-white/10 p-0 h-auto">
            <TabsTrigger
              value="borrow"
              className="flex-1 py-3 text-sm font-bold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-securdWhite data-[state=active]:border-b-2 data-[state=active]:border-securdPrimaryLight text-securdGrey"
            >
              Borrow
            </TabsTrigger>
            <TabsTrigger
              value="repay"
              className="flex-1 py-3 text-sm font-bold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-securdWhite data-[state=active]:border-b-2 data-[state=active]:border-securdPrimaryLight text-securdGrey"
            >
              Repay
            </TabsTrigger>
          </TabsList>

          {/* Borrow tab */}
          <TabsContent value="borrow" className="p-6 flex flex-col gap-5 mt-0">
            <AmountInput
              symbol={market.underlyingSymbol}
              value={amount}
              onChange={setAmount}
              label="Borrow amount"
              maxLabel="80% safe limit"
              maxValue={`${maxBorrowUnderlying.toFixed(4)} ${market.underlyingSymbol}`}
              onMax={() => setAmount(maxBorrowUnderlying.toFixed(6))}
            />
            <ImpactRows
              rows={[
                { label: "Borrow APY", value: formatAPY(market.borrowAPY), valueClass: "text-systemRed" },
                { label: "Borrow Balance", value: formatUSD(newBorrowUSD) },
                { label: "Borrow Limit Used", value: `${(newBorrowUsed * 100).toFixed(1)}%` },
                { label: "Preview", value: previewLabel },
              ]}
            />
            {userAccount && (
              <div className="flex flex-col gap-3">
                <BorrowLimitBar used={newBorrowUsed} limitUSD={borrowLimitUSD} />
                <HealthFactor value={newHF} />
              </div>
            )}
            <ActionButton
              label={isPending ? "Submitting…" : `Borrow ${market.underlyingSymbol}`}
              disabled={!isValid || newBorrowUsed >= 1 || isPending || borrowPreview.isLoading || borrowBlocked}
              warning={
                borrowBlocked
                  ? borrowPreview.reason
                  : newBorrowUsed >= 0.8 ? "High utilization — liquidation risk" : undefined
              }
              onClick={() =>
                submit({
                  market: market.cToken,
                  underlying: market.underlying,
                  actionType: ACTION_TYPE.BORROW,
                  amountXrp: inputAmount,
                })
              }
            />
          </TabsContent>

          {/* Repay tab */}
          <TabsContent value="repay" className="p-6 flex flex-col gap-5 mt-0">
            <AmountInput
              symbol={market.underlyingSymbol}
              value={amount}
              onChange={(v) => { setIsMaxRepay(false); setAmount(v); }}
              label="Repay amount"
              maxLabel="Borrowed"
              maxValue={`${borrowedUnderlying.toFixed(4)} ${market.underlyingSymbol}`}
              onMax={() => {
                setIsMaxRepay(true);
                setAmount((borrowedUnderlying * REPAY_MAX_BUFFER).toFixed(6));
              }}
            />
            {isMaxRepay && (
              <p className="text-xs text-securdGrey text-center -mt-3">
                +0.5% buffer included to cover interest accrued during bridge relay
              </p>
            )}
            <ImpactRows
              rows={[
                { label: "Borrow APY", value: formatAPY(market.borrowAPY), valueClass: "text-systemRed" },
                { label: "Currently Borrowed", value: formatUSD(borrowedUSD) },
                { label: "Remaining After Repay", value: formatUSD(Math.max(0, borrowedUSD - inputUSD)) },
                { label: "Preview", value: "Projected preview" },
              ]}
            />
            {userAccount && (
              <div className="flex flex-col gap-3">
                <BorrowLimitBar used={newBorrowUsed} limitUSD={borrowLimitUSD} />
                <HealthFactor value={newHF === Infinity || newBorrowUSD <= 0 ? Infinity : newHF} />
              </div>
            )}
            <ActionButton
              label={isPending ? "Submitting…" : `Repay ${market.underlyingSymbol}`}
              disabled={!isValid || isPending}
              onClick={() =>
                submit({
                  market: market.cToken,
                  underlying: market.underlying,
                  actionType: ACTION_TYPE.REPAY,
                  amountXrp: inputAmount,
                })
              }
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AmountInput({
  symbol,
  value,
  onChange,
  label,
  maxLabel,
  maxValue,
  onMax,
}: {
  symbol: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  maxLabel: string;
  maxValue: string;
  onMax?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs text-securdGrey">
        <span>{label}</span>
        <span>
          {maxLabel}:{" "}
          <button
            type="button"
            onClick={onMax}
            className="text-securdPrimaryLight hover:text-securdWhite transition-colors font-medium"
          >
            {maxValue}
          </button>
        </span>
      </div>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-securdPrimaryLight transition-colors">
        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-securdWhite text-xl font-bold placeholder:text-white/20 outline-none tabular-nums"
        />
        <span className="text-securdGrey text-sm font-medium shrink-0">{symbol}</span>
      </div>
    </div>
  );
}

function ImpactRows({
  rows,
}: {
  rows: { label: string; value: string; valueClass?: string }[];
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
      {rows.map(({ label, value, valueClass }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-securdGrey text-sm">{label}</span>
          <span className={`text-sm font-medium tabular-nums ${valueClass ?? "text-securdWhite"}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  warning,
  onClick,
}: {
  label: string;
  disabled: boolean;
  warning?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {warning && (
        <p className="text-systemYellow text-xs text-center">{warning}</p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all
          bg-securdPrimary text-securdWhite
          hover:bg-securdPrimary/80
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {label}
      </button>
    </div>
  );
}
