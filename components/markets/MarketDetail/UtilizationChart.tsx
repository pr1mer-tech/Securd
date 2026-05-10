import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

export function UtilizationChart({ market }: Props) {
  const pct = Math.min(market.utilization, 100);
  const kinkPct = 80; // typical kink

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
      <h3 className="font-poppins font-bold text-securdWhite mb-4">
        Interest Rate Model
      </h3>

      {/* Simple utilization bar with kink indicator */}
      <div className="flex flex-col gap-4">
        <div className="relative h-3 rounded-full bg-white/10 overflow-visible">
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-securdPrimary to-securdPrimaryLight"
            style={{ width: `${pct}%` }}
          />
          {/* Kink marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-systemYellow rounded-full"
            style={{ left: `${kinkPct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-securdGrey">
          <span>0%</span>
          <span className="text-systemYellow">Kink {kinkPct}%</span>
          <span>100%</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <RateCard label="Utilization" value={`${pct.toFixed(1)}%`} />
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
