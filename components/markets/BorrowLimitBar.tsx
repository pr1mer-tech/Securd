import { cn } from "@/lib/utils";
import { formatUSD } from "@/lib/helpers/market.helpers";

type Props = {
  used: number;       // 0–1
  limitUSD: number;
  className?: string;
};

export function BorrowLimitBar({ used, limitUSD, className }: Props) {
  const pct = Math.min(used * 100, 100);

  const barColor =
    pct < 60  ? "bg-systemGreen"
    : pct < 80 ? "bg-systemYellow"
    : "bg-systemRed";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex justify-between items-center">
        <span className="text-securdGrey text-xs">Borrow Limit</span>
        <span className="text-securdWhite text-xs tabular-nums font-medium">
          {formatUSD(limitUSD)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-end">
        <span className="text-securdGrey text-[11px] tabular-nums">
          {pct.toFixed(1)}% used
        </span>
      </div>
    </div>
  );
}
