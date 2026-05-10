import { cn } from "@/lib/utils";
import { healthFactorColor, healthFactorLabel } from "@/lib/helpers/market.helpers";

type Props = {
  value: number | null;
  className?: string;
};

export function HealthFactor({ value, className }: Props) {
  if (value === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-securdGrey text-sm">Health Factor</span>
        <span className="text-securdGrey text-sm">—</span>
      </div>
    );
  }

  const color = healthFactorColor(value);
  const label = healthFactorLabel(value);
  const display = value === Infinity ? "∞" : value.toFixed(2);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-securdGrey text-sm">Health Factor</span>
      <span className={cn("font-bold text-sm tabular-nums", color)}>
        {display}
      </span>
      <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", color,
        value > 2 || value === Infinity
          ? "bg-systemGreen/10"
          : value > 1.25
          ? "bg-systemYellow/10"
          : "bg-systemRed/10"
      )}>
        {label}
      </span>
    </div>
  );
}
