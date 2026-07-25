import { formatUSD, formatAPY, toUSD } from "@/lib/helpers/market.helpers";
import type { MarketData } from "@/lib/types/market.types";

type Props = { market: MarketData };

export function MarketStats({ market }: Props) {
  const reserveFactor = (Number(market.reserveFactor) / 1e18) * 100;
  const collateralFactor = (Number(market.collateralFactor) / 1e18) * 100;
  const totalReservesUSD = toUSD(market.totalReserves, market.underlyingDecimals, market.priceUSD);

  const stats = [
    { label: "Total Supply", value: formatUSD(market.totalSupplyUSD) },
    { label: "Total Borrow", value: formatUSD(market.totalBorrowsUSD) },
    { label: "Available Liquidity", value: formatUSD(market.availableLiquidityUSD) },
    { label: "Total Reserves", value: formatUSD(totalReservesUSD) },
    { label: "Utilization", value: `${market.utilization.toFixed(1)}%` },
    { label: "Supply APY", value: formatAPY(market.supplyAPY), valueClass: "text-systemGreen" },
    { label: "Borrow APY", value: formatAPY(market.borrowAPY), valueClass: "text-systemRed" },
    { label: "Collateral Factor", value: `${collateralFactor.toFixed(0)}%` },
    { label: "Reserve Factor", value: `${reserveFactor.toFixed(0)}%` },
    { label: "Price", value: `$${market.priceUSD.toFixed(4)}` },
  ];

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
      <h3 className="font-poppins font-bold text-securdWhite mb-4">Market Info</h3>
      <div className="flex flex-col divide-y divide-white/10">
        {stats.map(({ label, value, valueClass }) => (
          <div key={label} className="flex justify-between items-center py-3">
            <span className="text-securdGrey text-sm">{label}</span>
            <span className={`text-sm font-medium tabular-nums ${valueClass ?? "text-securdWhite"}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
