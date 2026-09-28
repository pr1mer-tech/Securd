"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketData } from "@/lib/types/market.types";
import type { ReactNode } from "react";

type Props = { market: MarketData };

type Metric = "rates" | "utilization" | "liquidity";

type HistoryPoint = {
  snapshotAt: string;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  availableLiquidityUSD: number;
  priceUSD: number;
};

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 18, right: 22, bottom: 28, left: 46 };

export function MarketHistoryChart({ market }: Props) {
  const [metric, setMetric] = useState<Metric>("rates");
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setIsLoading(true);
      setWarning(null);

      try {
        const res = await fetch(`/api/markets/${market.cToken}/history?days=30`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setWarning(json.error ?? "Unable to load market history");
          setPoints([]);
          return;
        }

        setWarning(json.warning ?? null);
        setPoints(Array.isArray(json.points) ? json.points : []);
      } catch {
        if (!cancelled) {
          setWarning("Unable to load market history");
          setPoints([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [market.cToken]);

  const series = useMemo(() => buildSeries(points, metric), [points, metric]);

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-poppins font-bold text-securdWhite">
              Market History
            </h3>
            <span className="text-sm text-securdGrey">
              Snapshot history from the market indexer
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
            <MetricButton active={metric === "rates"} onClick={() => setMetric("rates")}>
              APY
            </MetricButton>
            <MetricButton active={metric === "utilization"} onClick={() => setMetric("utilization")}>
              Utilization
            </MetricButton>
            <MetricButton active={metric === "liquidity"} onClick={() => setMetric("liquidity")}>
              Liquidity
            </MetricButton>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111417]">
          {isLoading ? (
            <EmptyChart message="Loading history..." />
          ) : points.length < 2 ? (
            <EmptyChart message={warning ?? "Not enough indexed snapshots yet"} />
          ) : (
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-[240px] w-full"
              role="img"
              aria-label={`${market.underlyingSymbol} historical market data`}
            >
              <HistoryGrid yMax={series.yMax} formatter={series.formatter} />
              {series.lines.map((line) => (
                <polyline
                  key={line.label}
                  points={line.points}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          )}
        </div>

        {points.length >= 2 && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {series.lines.map((line) => (
              <span key={line.label} className="inline-flex items-center gap-2 text-securdGrey">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {line.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildSeries(points: HistoryPoint[], metric: Metric) {
  if (metric === "rates") {
    const yMax = roundMax(Math.max(...points.map((p) => Math.max(p.supplyAPY, p.borrowAPY)), 1));
    return {
      yMax,
      formatter: formatPercent,
      lines: [
        {
          label: "Supply APY",
          color: "rgb(34, 197, 94)",
          points: pointsToPolyline(points, yMax, (p) => p.supplyAPY),
        },
        {
          label: "Borrow APY",
          color: "rgb(239, 68, 68)",
          points: pointsToPolyline(points, yMax, (p) => p.borrowAPY),
        },
      ],
    };
  }

  if (metric === "utilization") {
    return {
      yMax: 100,
      formatter: formatPercent,
      lines: [
        {
          label: "Utilization",
          color: "rgb(20, 184, 166)",
          points: pointsToPolyline(points, 100, (p) => p.utilization),
        },
      ],
    };
  }

  const yMax = roundMax(Math.max(
    ...points.map((p) => Math.max(p.totalSupplyUSD, p.totalBorrowsUSD, p.availableLiquidityUSD)),
    1,
  ));
  return {
    yMax,
    formatter: formatCompactUSD,
    lines: [
      {
        label: "Total Supply",
        color: "rgb(20, 184, 166)",
        points: pointsToPolyline(points, yMax, (p) => p.totalSupplyUSD),
      },
      {
        label: "Total Borrow",
        color: "rgb(239, 68, 68)",
        points: pointsToPolyline(points, yMax, (p) => p.totalBorrowsUSD),
      },
      {
        label: "Available Liquidity",
        color: "rgb(59, 130, 246)",
        points: pointsToPolyline(points, yMax, (p) => p.availableLiquidityUSD),
      },
    ],
  };
}

function pointsToPolyline(
  points: HistoryPoint[],
  yMax: number,
  valueOf: (point: HistoryPoint) => number,
): string {
  const last = Math.max(1, points.length - 1);
  return points
    .map((point, index) => {
      const x = PAD.left + (index / last) * (WIDTH - PAD.left - PAD.right);
      const y = yForValue(valueOf(point), yMax);
      return `${x},${y}`;
    })
    .join(" ");
}

function yForValue(value: number, yMax: number): number {
  const bounded = Math.max(0, Math.min(yMax, value));
  const height = HEIGHT - PAD.top - PAD.bottom;
  return HEIGHT - PAD.bottom - (bounded / yMax) * height;
}

function HistoryGrid({
  yMax,
  formatter,
}: {
  yMax: number;
  formatter: (value: number) => string;
}) {
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <>
      {ticks.map((tick) => {
        const value = yMax * tick;
        const y = yForValue(value, yMax);
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={y}
              x2={WIDTH - PAD.right}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
            />
            <text
              x={PAD.left - 10}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255, 255, 255, 0.48)"
              fontSize="11"
            >
              {formatter(value)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-md px-3 text-xs font-bold transition-colors ${
        active
          ? "bg-securdPrimary text-securdWhite"
          : "text-securdGrey hover:text-securdWhite"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm text-securdGrey">
      {message}
    </div>
  );
}

function roundMax(value: number): number {
  if (value <= 5) return 5;
  if (value <= 10) return 10;
  if (value <= 25) return 25;
  if (value <= 50) return 50;
  if (value <= 100) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatCompactUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
