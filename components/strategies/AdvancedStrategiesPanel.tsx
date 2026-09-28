"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  DEFAULT_STRATEGY_INPUT,
  STRATEGY_MAINNET,
  STRATEGY_POOLS,
  buildStrategyPlan,
  type StrategyMode,
  type StrategyPlanInput,
  type StrategyPoolId,
} from "@/lib/strategies/advancedStrategies";
import { formatUSD, formatTokenAmount } from "@/lib/helpers/market.helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MODE_OPTIONS: { value: StrategyMode; label: string }[] = [
  { value: "leverage", label: "Leverage" },
  { value: "deleverage", label: "Deleverage" },
  { value: "delta-neutral", label: "Delta-neutral" },
];

const INPUT_TOOLTIPS = {
  strategy:
    "Leverage compounds LP collateral through borrow → add-liquidity → re-supply loops. Deleverage runs the same loops in reverse (withdraw → remove liquidity → repay) to unwind the position. Delta-neutral adds a short XRP hedge on top of the leverage loop.",
  pool: "XRPL AMM pool whose LP token is used as collateral on Securd. Its collateral factor caps how much each loop can borrow — and how much each unwind tranche can withdraw.",
  startingEquity:
    "USD value of your own LP capital, excluding borrowed funds. Every loop and unwind tranche is sized from this base amount.",
  loopCount:
    "Number of borrow / add-liquidity / re-supply cycles (or withdraw / remove-liquidity / repay cycles when deleveraging). More loops compound leverage but add signatures, gas, and relay risk.",
  xrpPrice:
    "Manual XRP/USD price used by the planner. Delta-neutral mode uses it to convert the hedge notional into an XRP amount.",
  safetyBuffer:
    "Share of the collateral factor deliberately left unused. A larger buffer lowers target leverage but keeps more distance from liquidation during relay delays and oracle drift.",
  rebalanceTrigger:
    "Drift threshold (%) between the current hedge and the target XRP exposure that triggers a rebalance. Lower values track delta tighter but rebalance more often.",
} as const;

const STRATEGY_TAB_CLASS =
  "flex h-auto flex-col items-start justify-start gap-1 rounded-none px-4 py-3 text-left text-securdGrey border-r border-white/10 last:border-r-0 border-b-2 border-b-transparent data-[state=active]:bg-white/[0.06] data-[state=active]:text-securdWhite data-[state=active]:border-b-securdPrimaryLight data-[state=active]:shadow-none";

export function AdvancedStrategiesPanel() {
  const [input, setInput] = useState<StrategyPlanInput>(DEFAULT_STRATEGY_INPUT);
  const plan = useMemo(() => buildStrategyPlan(input), [input]);
  const isDeleverage = input.mode === "deleverage";
  const blockedCount = plan.executionReadiness.controls.filter(
    (control) => control.status === "blocked",
  ).length;
  const partialCount = plan.executionReadiness.controls.filter(
    (control) => control.status === "partial",
  ).length;

  const update = <K extends keyof StrategyPlanInput>(
    key: K,
    value: StrategyPlanInput[K],
  ) => setInput((current) => ({ ...current, [key]: value }));

  return (
    <TooltipProvider delayDuration={150}>
      <section className="bg-white/3 rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-securdPrimaryLight" />
            <h2 className="font-poppins font-bold text-securdWhite text-lg">
              Advanced Strategies
            </h2>
          </div>
          <span className="text-sm text-securdGrey">
            Mainnet-only planner for LP leverage loops, unwinds, and XRP
            delta-neutral hedges
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-0">
          <div className="p-5 border-b xl:border-b-0 xl:border-r border-white/10 flex flex-col gap-5">
            <div className="rounded-lg border border-securdPrimary/30 bg-securdPrimary/10 p-3 text-xs text-securdWhite/85">
              <span className="font-bold text-securdWhite">Mainnet only:</span>{" "}
              {STRATEGY_MAINNET.xrplLedger} and {STRATEGY_MAINNET.xrplEvm} chain{" "}
              {STRATEGY_MAINNET.xrplEvmChainId}. Testnet wallets and RPCs must
              be blocked before execution is enabled.
            </div>

            <Field label="Strategy" tooltip={INPUT_TOOLTIPS.strategy}>
              <div className="grid grid-cols-3 gap-2">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update("mode", option.value)}
                    className={`h-10 rounded-lg text-sm font-bold transition-colors ${
                      input.mode === option.value
                        ? "bg-securdPrimary text-securdWhite"
                        : "bg-white/5 text-securdGrey hover:text-securdWhite"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Pool" tooltip={INPUT_TOOLTIPS.pool}>
              <select
                value={input.poolId}
                onChange={(event) =>
                  update("poolId", event.target.value as StrategyPoolId)
                }
                className="h-10 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-securdWhite outline-none"
              >
                {STRATEGY_POOLS.map((pool) => (
                  <option
                    key={pool.id}
                    value={pool.id}
                    className="bg-[#1a1d20]"
                  >
                    {pool.label}
                  </option>
                ))}
              </select>
            </Field>

            <NumberField
              label="Starting LP equity"
              tooltip={INPUT_TOOLTIPS.startingEquity}
              suffix="USD"
              value={input.startingEquityUSD}
              min={0}
              step={100}
              onChange={(value) =>
                update(
                  "startingEquityUSD",
                  clampUiNumber(value, 0, Number.MAX_SAFE_INTEGER),
                )
              }
            />
            <NumberField
              label="Loop count"
              tooltip={INPUT_TOOLTIPS.loopCount}
              suffix="loops"
              value={input.loopCount}
              min={0}
              max={6}
              step={1}
              onChange={(value) =>
                update("loopCount", clampUiNumber(Math.round(value), 0, 6))
              }
            />
            <NumberField
              label="XRP price"
              tooltip={INPUT_TOOLTIPS.xrpPrice}
              suffix="USD"
              value={input.xrpPriceUSD}
              min={0}
              step={0.01}
              onChange={(value) =>
                update(
                  "xrpPriceUSD",
                  clampUiNumber(value, 0, Number.MAX_SAFE_INTEGER),
                )
              }
            />
            <NumberField
              label="Safety buffer"
              tooltip={INPUT_TOOLTIPS.safetyBuffer}
              suffix="%"
              value={input.targetSafetyBufferPct}
              min={0}
              max={50}
              step={1}
              onChange={(value) =>
                update("targetSafetyBufferPct", clampUiNumber(value, 0, 50))
              }
            />
            {input.mode === "delta-neutral" && (
              <NumberField
                label="Rebalance trigger"
                tooltip={INPUT_TOOLTIPS.rebalanceTrigger}
                suffix="%"
                value={input.rebalanceTriggerPct}
                min={1}
                max={20}
                step={0.5}
                onChange={(value) =>
                  update("rebalanceTriggerPct", clampUiNumber(value, 1, 20))
                }
              />
            )}
          </div>

          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric
                label={isDeleverage ? "Leverage to unwind" : "Target leverage"}
                value={`${plan.targetLeverage.toFixed(2)}x`}
              />
              <Metric
                label="Max leverage"
                value={`${plan.maxLeverage.toFixed(2)}x`}
              />
              <Metric
                label={isDeleverage ? "Debt to repay" : "Total debt"}
                value={formatUSD(plan.debtUSD)}
              />
              <Metric
                label="Relay gas"
                value={`${plan.minGasXrp}-${plan.maxGasXrp} XRP`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/3 border border-white/10 p-4 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-securdWhite">
                  {isDeleverage ? "Repay Sizing" : "Borrow Sizing"}
                </h3>
                <Row
                  label={
                    isDeleverage ? "XRP repay notional" : "XRP borrow notional"
                  }
                  value={formatUSD(plan.xrpBorrowUSD)}
                />
                <Row
                  label={`${plan.pool.secondAssetSymbol} ${isDeleverage ? "repay" : "borrow"} notional`}
                  value={formatUSD(plan.pairedAssetBorrowUSD)}
                />
                <Row
                  label={
                    isDeleverage
                      ? "Collateral to unwind"
                      : "Collateral after loops"
                  }
                  value={formatUSD(plan.collateralUSD)}
                />
                <Row
                  label="Manual signatures"
                  value={`${plan.signatureCount}`}
                />
                {input.mode === "delta-neutral" && (
                  <Row
                    label="Target XRP hedge"
                    value={`${formatTokenAmount(plan.hedgeTargetXrp, 2)} XRP`}
                  />
                )}
              </div>

              <div className="rounded-xl bg-white/3 border border-white/10 p-4 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-securdWhite">
                  {isDeleverage ? "Loop Repay Ladder" : "Loop Borrow Ladder"}
                </h3>
                {plan.incrementalBorrowUSD.length === 0 ? (
                  <span className="text-sm text-securdGrey">
                    {isDeleverage
                      ? "No unwind loop selected"
                      : "No leverage loop selected"}
                  </span>
                ) : (
                  plan.incrementalBorrowUSD.map((value, index) => (
                    <Row
                      key={index}
                      label={
                        isDeleverage
                          ? `Unwind ${index + 1}`
                          : `Loop ${index + 1}`
                      }
                      value={`${formatUSD(value / 2)} in XRP + ${formatUSD(value / 2)} ${plan.pool.secondAssetSymbol}`}
                    />
                  ))
                )}
              </div>
            </div>

            <Tabs defaultValue="execution" className="flex flex-col gap-4">
              <TabsList className="grid w-full h-auto grid-cols-3 items-stretch rounded-xl border border-white/10 bg-white/2 p-0 overflow-hidden">
                <TabsTrigger value="execution" className={STRATEGY_TAB_CLASS}>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold">Execution</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-securdWhite/80">
                      {plan.steps.length} steps
                    </span>
                  </span>
                  <span className="hidden sm:block text-xs font-normal text-securdGrey">
                    Step-by-step transaction runbook
                  </span>
                </TabsTrigger>
                <TabsTrigger value="gates" className={STRATEGY_TAB_CLASS}>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold">Gates</span>
                    {blockedCount > 0 && (
                      <span className="rounded-md bg-systemRed/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-systemRed">
                        {blockedCount} blocked
                      </span>
                    )}
                    {partialCount > 0 && (
                      <span className="rounded-md bg-systemYellow/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-systemYellow">
                        {partialCount} partial
                      </span>
                    )}
                  </span>
                  <span className="hidden sm:block text-xs font-normal text-securdGrey">
                    Risk warnings and production controls
                  </span>
                </TabsTrigger>
                <TabsTrigger value="playbook" className={STRATEGY_TAB_CLASS}>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold">Playbook</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold leading-none text-securdWhite/80">
                      {plan.failurePlaybook.length} phases
                    </span>
                  </span>
                  <span className="hidden sm:block text-xs font-normal text-securdGrey">
                    Stop signals and unwind actions
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="execution" className="mt-0">
                <div className="rounded-xl bg-white/3 border border-white/10 p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-securdWhite">
                    Execution Runbook
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.steps.map((step, index) => (
                      <div
                        key={`${step.label}-${index}`}
                        className="flex gap-3"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-securdWhite">
                          {index + 1}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-securdWhite">
                            {step.label}
                          </span>
                          <span className="text-xs text-securdGrey">
                            {step.network}
                          </span>
                          <span className="text-xs text-securdGrey/80">
                            {step.action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gates" className="mt-0 flex flex-col gap-4">
                <div className="rounded-xl border border-systemYellow/30 bg-systemYellow/10 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-systemYellow text-sm font-bold">
                    <AlertTriangle size={16} />
                    Strategy gates
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.warnings.map((warning) => (
                      <div
                        key={warning}
                        className="flex items-start gap-2 text-xs text-securdWhite/85"
                      >
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-systemYellow"
                        />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-systemRed/30 bg-systemRed/10 p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-systemRed text-sm font-bold">
                      <ShieldAlert size={16} />
                      Execution readiness
                    </div>
                    <span className="rounded-full bg-systemRed/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-systemRed">
                      {plan.executionReadiness.blockingControlCount} blockers
                    </span>
                  </div>
                  <span className="text-xs text-securdWhite/80">
                    {plan.executionReadiness.statusLabel}
                  </span>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {plan.executionReadiness.controls.map((control) => (
                      <div
                        key={control.id}
                        className="rounded-lg border border-white/10 bg-black/10 p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-securdWhite">
                            {control.label}
                          </span>
                          <StatusPill status={control.status} />
                        </div>
                        <span className="text-xs text-securdGrey">
                          {control.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="playbook" className="mt-0">
                <div className="rounded-xl bg-white/3 border border-white/10 p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-securdWhite">
                    Unwind Playbook
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {plan.failurePlaybook.map((item) => (
                      <div
                        key={item.phase}
                        className="rounded-lg border border-white/10 bg-white/2 p-3 flex flex-col gap-2"
                      >
                        <span className="text-sm font-medium text-securdWhite">
                          {item.phase}
                        </span>
                        <Row label="Stop" value={item.stopSignal} />
                        <Row label="Exposure" value={item.exposure} />
                        <Row label="Action" value={item.unwindAction} />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}

function Field({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-securdGrey">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {children}
    </label>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="More info"
          className="text-securdGrey/70 hover:text-securdWhite transition-colors"
        >
          <Info size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-72 border-white/10 bg-[#1a1d20] text-securdWhite/90 text-xs normal-case tracking-normal"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function NumberField({
  label,
  tooltip,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  tooltip?: string;
  suffix: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} tooltip={tooltip}>
      <div className="flex h-10 items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-sm font-medium text-securdWhite outline-none tabular-nums"
        />
        <span className="shrink-0 text-xs text-securdGrey">{suffix}</span>
      </div>
    </Field>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/3 border border-white/10 p-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-securdGrey">
        {label}
      </span>
      <span className="text-lg font-bold text-securdWhite tabular-nums">
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-securdGrey">{label}</span>
      <span className="text-right font-medium text-securdWhite tabular-nums">
        {value}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: "covered" | "partial" | "blocked" }) {
  const className =
    status === "covered"
      ? "bg-systemGreen/15 text-systemGreen"
      : status === "partial"
        ? "bg-systemYellow/15 text-systemYellow"
        : "bg-systemRed/15 text-systemRed";

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${className}`}
    >
      {status}
    </span>
  );
}

function clampUiNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
