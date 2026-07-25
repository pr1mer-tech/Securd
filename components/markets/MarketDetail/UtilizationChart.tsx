import { buildRateCurve } from "@/lib/helpers/market.helpers";
import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

// SVG viewBox geometry — fixed units, scaled to the container via CSS.
const WIDTH = 320;
const HEIGHT = 140;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

export function UtilizationChart({ market }: Props) {
  const pct = Math.min(Math.max(market.utilization, 0), 100);
  const kinkPct = Math.min(100, Math.max(0, Number(market.kink) / 1e16));
  const curve = buildRateCurve(market);

  // Scale the y-axis to whatever the curve actually reaches (never below 1%
  // so a flat/near-zero curve doesn't divide by ~0), rather than a fixed
  // range that could clip a steep post-kink jump.
  const maxRate = Math.max(
    1,
    ...curve.map((p) => p.borrowAPY),
    ...curve.map((p) => p.supplyAPY),
  );

  const x = (u: number) => PAD_LEFT + (u / 100) * PLOT_W;
  const y = (v: number) => PAD_TOP + PLOT_H - (Math.max(v, 0) / maxRate) * PLOT_H;

  const borrowPoints = curve.map((p) => `${x(p.utilizationPct)},${y(p.borrowAPY)}`).join(" ");
  const supplyPoints = curve.map((p) => `${x(p.utilizationPct)},${y(p.supplyAPY)}`).join(" ");

  const currentX = x(pct);
  const kinkX = x(kinkPct);

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
      <h3 className="font-poppins font-bold text-securdWhite mb-1">
        Interest Rate Model
      </h3>
      <p className="text-securdGrey text-xs mb-4">
        Borrow and supply APY across the full utilization range, computed from
        this market&apos;s on-chain rate model.
      </p>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-36"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Interest rate curve for ${market.underlyingSymbol}`}
      >
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={PAD_TOP + PLOT_H * f}
            y2={PAD_TOP + PLOT_H * f}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}

        {/* Kink marker — read from the market's real IRM, not assumed */}
        <line
          x1={kinkX}
          x2={kinkX}
          y1={PAD_TOP}
          y2={PAD_TOP + PLOT_H}
          stroke="#E8A029"
          strokeDasharray="3,3"
          strokeWidth={1}
        />

        {/* Rate curves */}
        <polyline points={borrowPoints} fill="none" stroke="#E95A4C" strokeWidth={2} />
        <polyline points={supplyPoints} fill="none" stroke="#3CC27A" strokeWidth={2} />

        {/* Current utilization marker */}
        <line
          x1={currentX}
          x2={currentX}
          y1={PAD_TOP}
          y2={PAD_TOP + PLOT_H}
          stroke="rgba(255,255,255,0.25)"
        />
        <circle cx={currentX} cy={y(market.borrowAPY)} r={3} fill="#E95A4C" />
        <circle cx={currentX} cy={y(market.supplyAPY)} r={3} fill="#3CC27A" />

        {/* Axis labels */}
        <text x={PAD_LEFT} y={HEIGHT - 4} fontSize="8" fill="rgba(144,160,176,1)">
          0%
        </text>
        <text x={kinkX} y={HEIGHT - 4} fontSize="8" fill="#E8A029" textAnchor="middle">
          Kink {kinkPct.toFixed(0)}%
        </text>
        <text
          x={WIDTH - PAD_RIGHT}
          y={HEIGHT - 4}
          fontSize="8"
          fill="rgba(144,160,176,1)"
          textAnchor="end"
        >
          100%
        </text>
      </svg>

      <div className="flex items-center gap-4 mt-1 mb-4 text-xs">
        <LegendDot color="#E95A4C" label="Borrow APY" />
        <LegendDot color="#3CC27A" label="Supply APY" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <RateCard label="Current Utilization" value={`${pct.toFixed(1)}%`} />
        <RateCard
          label="Borrow APY"
          value={`${market.borrowAPY.toFixed(2)}%`}
          valueClass="text-systemRed"
        />
        <RateCard
          label="Supply APY"
          value={`${market.supplyAPY.toFixed(2)}%`}
          valueClass="text-systemGreen"
        />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-securdGrey">{label}</span>
    </div>
  );
}

function RateCard({
  label,
  value,
  valueClass = "text-securdWhite",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-1">
      <span className="text-securdGrey text-[11px]">{label}</span>
      <span className={`font-bold text-sm tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}
