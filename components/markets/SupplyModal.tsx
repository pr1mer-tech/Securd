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
import { formatUSD, formatAPY } from "@/lib/helpers/market.helpers";
import { useSubmitIntent, ACTION_TYPE } from "@/lib/xrpl/useSubmitIntent";
import { TxStatusModal } from "./TxStatusModal";
import type { MarketData, UserMarketPosition, UserAccount } from "@/lib/types/market.types";

type Props = {
  market: MarketData;
  position?: UserMarketPosition;
  defaultAction: "supply" | "withdraw";
  onClose: () => void;
  userAccount?: UserAccount | null;
  walletBalance?: number | null;
};

export function SupplyModal({ market, position, defaultAction, onClose, userAccount, walletBalance }: Props) {
  const [tab, setTab] = useState<"supply" | "withdraw">(defaultAction);
  const [amount, setAmount] = useState("");
  const { submit, state, reset } = useSubmitIntent();
  const isPending = state.status === "signing" || state.status === "submitting";

  const supplyBalance = position?.supplyBalanceUSD ?? 0;
  const supplyBalanceUnderlying =
    Number(position?.supplyBalanceUnderlying ?? 0n) / 10 ** market.underlyingDecimals;

  // Impact preview — Step 4 will compute real impact
  const newBorrowLimit =
    tab === "supply"
      ? (userAccount?.borrowLimitUSD ?? 0) +
        (parseFloat(amount || "0") * market.priceUSD * Number(market.collateralFactor) / 1e18)
      : (userAccount?.borrowLimitUSD ?? 0) -
        (parseFloat(amount || "0") * market.priceUSD * Number(market.collateralFactor) / 1e18);

  const newBorrowLimitUsed =
    newBorrowLimit > 0
      ? (userAccount?.totalBorrowUSD ?? 0) / newBorrowLimit
      : 0;

  const isValid = parseFloat(amount) > 0;

  // Show Axelar tracking modal once we have a txHash
  if (state.txHash) {
    return (
      <TxStatusModal
        txHash={state.txHash}
        actionLabel={tab === "supply" ? `Supply ${market.underlyingSymbol}` : `Withdraw ${market.underlyingSymbol}`}
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

        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setAmount(""); }}>
          <TabsList className="w-full rounded-none bg-white/5 border-b border-white/10 p-0 h-auto">
            <TabsTrigger
              value="supply"
              className="flex-1 py-3 text-sm font-bold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-securdWhite data-[state=active]:border-b-2 data-[state=active]:border-securdPrimaryLight text-securdGrey"
            >
              Supply
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="flex-1 py-3 text-sm font-bold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-securdWhite data-[state=active]:border-b-2 data-[state=active]:border-securdPrimaryLight text-securdGrey"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          {/* Supply tab */}
          <TabsContent value="supply" className="p-6 flex flex-col gap-5 mt-0">
            <AmountInput
              symbol={market.underlyingSymbol}
              value={amount}
              onChange={setAmount}
              label="Supply amount"
              maxLabel="Wallet balance"
              maxValue={
                walletBalance != null
                  ? `${walletBalance.toFixed(4)} ${market.underlyingSymbol}`
                  : "—"
              }
              onMax={
                walletBalance != null
                  ? () => setAmount(walletBalance.toFixed(6))
                  : undefined
              }
            />
            <ImpactRows
              rows={[
                { label: "Supply APY", value: formatAPY(market.supplyAPY), valueClass: "text-systemGreen" },
                { label: "Borrow Limit", value: formatUSD(newBorrowLimit) },
              ]}
            />
            {userAccount && (
              <BorrowLimitBar used={newBorrowLimitUsed} limitUSD={newBorrowLimit} />
            )}
            <ActionButton
              label={isPending ? "Submitting…" : `Supply ${market.underlyingSymbol}`}
              disabled={!isValid || isPending}
              onClick={() =>
                submit({
                  market: market.cToken,
                  underlying: market.underlying,
                  actionType: ACTION_TYPE.SUPPLY,
                  amountXrp: parseFloat(amount),
                })
              }
            />
          </TabsContent>

          {/* Withdraw tab */}
          <TabsContent value="withdraw" className="p-6 flex flex-col gap-5 mt-0">
            <AmountInput
              symbol={market.underlyingSymbol}
              value={amount}
              onChange={setAmount}
              label="Withdraw amount"
              maxLabel="Supplied"
              maxValue={`${supplyBalanceUnderlying.toFixed(4)} ${market.underlyingSymbol}`}
              onMax={() => setAmount(supplyBalanceUnderlying.toFixed(6))}
            />
            <ImpactRows
              rows={[
                { label: "Supply APY", value: formatAPY(market.supplyAPY), valueClass: "text-systemGreen" },
                { label: "Currently Supplied", value: formatUSD(supplyBalance) },
                { label: "New Borrow Limit", value: formatUSD(newBorrowLimit) },
              ]}
            />
            {userAccount && (
              <BorrowLimitBar used={newBorrowLimitUsed} limitUSD={newBorrowLimit} />
            )}
            <ActionButton
              label={isPending ? "Submitting…" : `Withdraw ${market.underlyingSymbol}`}
              disabled={!isValid || isPending}
              onClick={() =>
                submit({
                  market: market.cToken,
                  underlying: market.underlying,
                  actionType: ACTION_TYPE.WITHDRAW,
                  amountXrp: parseFloat(amount),
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
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick?: () => void;
}) {
  return (
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
  );
}
