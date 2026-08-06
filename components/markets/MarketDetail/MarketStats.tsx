import {
  formatAPY,
  formatPercent,
  formatTokenAmount,
  formatUSD,
  mantissaToPercent,
} from "@/lib/helpers/market.helpers";
import { ExternalLink } from "lucide-react";
import { NATIVE_UNDERLYING } from "@/lib/constants/markets";
import { ADDRESSES } from "@/lib/constants/contracts";
import { xrplEvmTestnet } from "@/lib/constants/xrplEvmChain";
import type { MarketData } from "@/lib/types/market.types";
import type { ReactNode } from "react";

type Props = { market: MarketData };

export function MarketStats({ market }: Props) {
  const reserveFactor = mantissaToPercent(market.reserveFactor);
  const collateralFactor = mantissaToPercent(market.collateralFactor);
  const closeFactor = mantissaToPercent(market.closeFactor);
  const liquidationIncentive = mantissaToPercent(market.liquidationIncentive);
  const protocolSeizeShare = mantissaToPercent(market.protocolSeizeShare);
  const liquidationPenalty = Math.max(0, liquidationIncentive - 100);
  const exchangeRate = Number(market.exchangeRate) / 1e18;
  const totalReservesUSD = toUsdFromRaw(
    market.totalReserves,
    market.underlyingDecimals,
    market.priceUSD,
  );

  return (
    <div className="bg-white/3 rounded-2xl border border-white/10 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-poppins font-bold text-securdWhite">
              Market Analytics
            </h3>
            <span className="text-sm text-securdGrey">
              Protocol liquidity, risk limits, and market mechanics
            </span>
          </div>
          <StatusPill
            label={market.isListed ? "Listed" : "Not listed"}
            tone={market.isListed ? "green" : "red"}
          />
        </div>

        <Section title="Liquidity">
          <MetricRow
            label="Total Supply"
            value={formatUSD(market.totalSupplyUSD)}
          />
          <MetricRow
            label="Total Borrow"
            value={formatUSD(market.totalBorrowsUSD)}
          />
          <MetricRow
            label="Available Liquidity"
            value={formatUSD(market.availableLiquidityUSD)}
          />
          <MetricRow
            label="Protocol Reserves"
            value={formatUSD(totalReservesUSD)}
          />
          <MetricRow
            label="Utilization"
            value={formatPercent(market.utilization, 1)}
          />
        </Section>

        <Section title="Risk Parameters">
          <MetricRow
            label="Collateral Factor"
            value={formatPercent(collateralFactor, 0)}
          />
          <MetricRow
            label="Reserve Factor"
            value={formatPercent(reserveFactor, 0)}
          />
          <MetricRow label="Borrow Cap" value={formatBorrowCap(market)} />
          <MetricRow
            label="Supply Status"
            value={market.mintGuardianPaused ? "Paused" : "Active"}
            valueClass={
              market.mintGuardianPaused ? "text-systemRed" : "text-systemGreen"
            }
          />
          <MetricRow
            label="Borrow Status"
            value={market.borrowGuardianPaused ? "Paused" : "Active"}
            valueClass={
              market.borrowGuardianPaused
                ? "text-systemRed"
                : "text-systemGreen"
            }
          />
          <MetricRow
            label="cToken Transfer"
            value={market.transferGuardianPaused ? "Paused" : "Active"}
            valueClass={
              market.transferGuardianPaused
                ? "text-systemRed"
                : "text-systemGreen"
            }
          />
        </Section>

        <Section title="Liquidation Parameters">
          <MetricRow
            label="Close Factor"
            value={formatPercent(closeFactor, 0)}
          />
          <MetricRow
            label="Liquidation Incentive"
            value={formatPercent(liquidationIncentive, 0)}
          />
          <MetricRow
            label="Liquidation Penalty"
            value={formatPercent(liquidationPenalty, 0)}
          />
          <MetricRow
            label="Protocol Seize Share"
            value={formatPercent(protocolSeizeShare, 0)}
          />
        </Section>

        <Section title="Protocol Mechanics">
          <MetricRow
            label="Oracle Price"
            value={`$${market.priceUSD.toFixed(4)}`}
          />
          <MetricRow
            label={`1 ${market.symbol}`}
            value={`${formatTokenAmount(exchangeRate, 6)} ${market.underlyingSymbol}`}
          />
          <MetricRow
            label="Supply APY"
            value={formatAPY(market.supplyAPY)}
            valueClass="text-systemGreen"
          />
          <MetricRow
            label="Borrow APY"
            value={formatAPY(market.borrowAPY)}
            valueClass="text-systemRed"
          />
          <MetricRow
            label="Rewards"
            value={market.isRewarded ? "Enabled" : "Disabled"}
          />
          <MetricRow
            label="Rate Model"
            value={shortAddress(market.interestRateModel)}
            valueClass="font-mono"
          />
        </Section>

        <Section title="Contracts">
          <AddressLinkRow label="cToken" address={market.cToken} />
          <AddressLinkRow
            label="Underlying"
            address={
              market.underlying.toLowerCase() ===
              NATIVE_UNDERLYING.toLowerCase()
                ? undefined
                : market.underlying
            }
            fallback="Native XRP"
          />
          <AddressLinkRow label="Comptroller" address={ADDRESSES.comptroller} />
          <AddressLinkRow label="Oracle" address={ADDRESSES.oracle} />
          <AddressLinkRow
            label="Rate Model"
            address={market.interestRateModel}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-xs uppercase tracking-wider text-securdGrey">
        {title}
      </h4>
      <div className="flex flex-col divide-y divide-white/10">{children}</div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-3">
      <span className="text-securdGrey text-sm">{label}</span>
      <span
        className={`text-sm font-medium tabular-nums text-right ${valueClass ?? "text-securdWhite"}`}
      >
        {value}
      </span>
    </div>
  );
}

function AddressLinkRow({
  label,
  address,
  fallback = "-",
}: {
  label: string;
  address?: string;
  fallback?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-4 py-3">
      <span className="text-securdGrey text-sm">{label}</span>
      {address ? (
        <a
          href={explorerAddressUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium font-mono tabular-nums text-securdPrimaryLight hover:text-securdWhite transition-colors"
        >
          {shortAddress(address)}
          <ExternalLink size={12} />
        </a>
      ) : (
        <span className="text-sm font-medium text-securdWhite">{fallback}</span>
      )}
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "red" }) {
  const cls =
    tone === "green"
      ? "border-systemGreen/30 bg-systemGreen/10 text-systemGreen"
      : "border-systemRed/30 bg-systemRed/10 text-systemRed";

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${cls}`}
    >
      {label}
    </span>
  );
}

function formatBorrowCap(market: MarketData): string {
  if (market.borrowCap === 0n) return "No cap";
  const amount = Number(market.borrowCap) / 10 ** market.underlyingDecimals;
  return `${formatTokenAmount(amount, 2)} ${market.underlyingSymbol}`;
}

function toUsdFromRaw(
  value: bigint,
  decimals: number,
  priceUSD: number,
): number {
  return (Number(value) / 10 ** decimals) * priceUSD;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function explorerAddressUrl(address: string): string {
  return `${xrplEvmTestnet.blockExplorers.default.url}/address/${address}`;
}
