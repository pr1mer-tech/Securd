import {
  annualizeRatePerBlock,
  calcBorrowRateAtUtilization,
  calcSupplyRateAtUtilization,
  formatAPY,
  formatPercent,
  mantissaToPercent,
} from "@/lib/helpers/market.helpers";
import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const PADDING = { top: 18, right: 24, bottom: 34, left: 44 };
const MANTISSA = 10n ** 18n;

type CurvePoint = {
  utilizationPct: number;
  borrowAPY: number;
  supplyAPY: number;
};

export function UtilizationChart({ market }: Props) {
  const reserveFactorPct = mantissaToPercent(market.reserveFactor);
  const kinkPct = mantissaToPercent(market.kink);
  const baseAPY = annualizeRatePerBlock(
    market.baseRatePerBlock,
    market.blocksPerYear,
  );
  const multiplierAPY = annualizeRatePerBlock(
    market.multiplierPerBlock,
    market.blocksPerYear,
  );
  const jumpMultiplierAPY = annualizeRatePerBlock(
    market.jumpMultiplierPerBlock,
    market.blocksPerYear,
  );
  const points = buildCurvePoints(market, reserveFactorPct);
  const maxRate = Math.max(
    1,
    ...points.map((p) => Math.max(p.borrowAPY, p.supplyAPY)),
    market.borrowAPY,
    market.supplyAPY,
  );
  const yMax = roundChartMax(maxRate);
  const borrowLine = pointsToPolyline(points, yMax, "borrowAPY");
  const supplyLine = pointsToPolyline(points, yMax, "supplyAPY");
  const currentX = xForUtilization(market.utilization);
  const currentBorrowY = yForRate(market.borrowAPY, yMax);
  const currentSupplyY = yForRate(market.supplyAPY, yMax);
  const kinkX = xForUtilization(kinkPct);

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-poppins font-bold text-securdWhite">
              Interest Rate Curve
            </h3>
            <span className="text-sm text-securdGrey">
              Jump-rate model across market utilization
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <LegendDot className="bg-systemRed" label="Borrow APY" />
            <LegendDot className="bg-systemGreen" label="Supply APY" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111417]">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[260px] w-full"
            role="img"
            aria-label={`${market.underlyingSymbol} interest rate curve`}
          >
            <ChartGrid yMax={yMax} />

            <line
              x1={kinkX}
              y1={PADDING.top}
              x2={kinkX}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(245, 158, 11, 0.7)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            <text
              x={Math.min(kinkX + 6, CHART_WIDTH - 82)}
              y={PADDING.top + 12}
              fill="rgb(245, 158, 11)"
              fontSize="11"
            >
              Kink {formatPercent(kinkPct, 0)}
            </text>

            <polyline
              points={borrowLine}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={supplyLine}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <line
              x1={currentX}
              y1={PADDING.top}
              x2={currentX}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1"
            />
            <circle cx={currentX} cy={currentBorrowY} r="5" fill="rgb(239, 68, 68)" />
            <circle cx={currentX} cy={currentSupplyY} r="5" fill="rgb(34, 197, 94)" />
            <text
              x={Math.min(currentX + 8, CHART_WIDTH - 112)}
              y={CHART_HEIGHT - PADDING.bottom - 8}
              fill="rgba(255, 255, 255, 0.82)"
              fontSize="11"
            >
              Current {formatPercent(market.utilization, 1)}
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <RateCard label="Current Utilization" value={formatPercent(market.utilization, 1)} />
          <RateCard label="Base Rate" value={formatAPY(baseAPY)} />
          <RateCard label="Slope Below Kink" value={formatAPY(multiplierAPY)} />
          <RateCard label="Slope Above Kink" value={formatAPY(jumpMultiplierAPY)} />
        </div>
      </div>
    </div>
  );
}

function buildCurvePoints(
  market: MarketData,
  reserveFactorPct: number,
): CurvePoint[] {
  return Array.from({ length: 26 }, (_, i) => {
    const utilizationPct = i * 4;
    const utilizationMantissa = BigInt(utilizationPct) * MANTISSA / 100n;
    const borrowAPY = calcBorrowRateAtUtilization({
      utilizationMantissa,
      baseRatePerBlock: market.baseRatePerBlock,
      multiplierPerBlock: market.multiplierPerBlock,
      jumpMultiplierPerBlock: market.jumpMultiplierPerBlock,
      kink: market.kink,
      blocksPerYear: market.blocksPerYear,
    });
    const supplyAPY = calcSupplyRateAtUtilization({
      borrowRateAPY: borrowAPY,
      utilizationPct,
      reserveFactorPct,
    });
    return { utilizationPct, borrowAPY, supplyAPY };
  });
}

function pointsToPolyline(
  points: CurvePoint[],
  yMax: number,
  key: "borrowAPY" | "supplyAPY",
): string {
  return points
    .map((point) => `${xForUtilization(point.utilizationPct)},${yForRate(point[key], yMax)}`)
    .join(" ");
}

function xForUtilization(utilizationPct: number): number {
  const bounded = Math.max(0, Math.min(100, utilizationPct));
  const width = CHART_WIDTH - PADDING.left - PADDING.right;
  return PADDING.left + (bounded / 100) * width;
}

function yForRate(rate: number, yMax: number): number {
  const bounded = Math.max(0, Math.min(yMax, rate));
  const height = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  return CHART_HEIGHT - PADDING.bottom - (bounded / yMax) * height;
}

function roundChartMax(value: number): number {
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  if (value <= 25) return 25;
  if (value <= 50) return 50;
  return Math.ceil(value / 25) * 25;
}

function ChartGrid({ yMax }: { yMax: number }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <>
      {ticks.map((tick) => {
        const y = yForRate(yMax * tick, yMax);
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={CHART_WIDTH - PADDING.right}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
            />
            <text
              x={PADDING.left - 10}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255, 255, 255, 0.48)"
              fontSize="11"
            >
              {formatPercent(yMax * tick, 0)}
            </text>
          </g>
        );
      })}
      {[0, 25, 50, 75, 100].map((tick) => {
        const x = xForUtilization(tick);
        return (
          <g key={tick}>
            <line
              x1={x}
              y1={PADDING.top}
              x2={x}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <text
              x={x}
              y={CHART_HEIGHT - 10}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.48)"
              fontSize="11"
            >
              {tick}%
            </text>
          </g>
        );
      })}
    </>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-securdGrey">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function RateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-securdGrey text-[11px]">{label}</span>
      <span className="font-bold text-sm tabular-nums text-securdWhite">{value}</span>
    </div>
  );
}
