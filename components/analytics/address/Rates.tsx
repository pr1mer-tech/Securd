"use client";

import { Card } from "@/components/ui/card";
import type { PoolDetails } from "@/lib/helpers/analytics.helper";
import { cn } from "@/lib/utils";
import Help from "@/components/ui/Help";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { Slider } from "@/components/ui/slider";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import { MenuTabsContent } from "@/components/ui/menu-tabs";
import {
  getBorrowApy,
  getBorrowerPoolMaxLeverage,
} from "@/lib/helpers/borrow.helpers";
import type { CollateralInfos } from "@/lib/types/farm.types";

export default function Rates({
  poolInfo,
  collateralInfo,
  className,
}: {
  poolInfo: PoolDetails;
  collateralInfo: CollateralInfos;
  className?: string;
}) {
  const leverage = useAnalyticsAddressStore.use.leverage();

  const r_0 = getBorrowApy(poolInfo?.reservesInfo?.[0]) ?? 1 / 100;
  const r_1 = getBorrowApy(poolInfo?.reservesInfo?.[1]) ?? 5 / 100;

  const minLeverage = 1;
  const sliderBase = (() => {
    const maxLeverage = getBorrowerPoolMaxLeverage(collateralInfo);

    if (maxLeverage) return maxLeverage;

    const mrm = poolInfo?.analytics?.[0]?.mrm;
    if (!mrm) return 0;

    if (mrm <= 1) return 19.5;
    if (mrm <= 2) return 18;
    if (mrm <= 3) return 16.1;
    if (mrm <= 4) return 10.2;
    if (mrm <= 5) return 5.8;
    if (mrm <= 6) return 3.1;

    return 1;
  })();

  return (
    <MenuTabsContent value="apy">
      <Card className={cn("p-4 w-full", className)}>
        <Table className="text-center">
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold pl-0 text-center border-r">
                Borrow Rate {poolInfo?.token_0?.token_symbol}
                <Help>The interest rate paid by borrowers to lenders.</Help>
              </TableHead>
              <TableCell className="font-bold text-center">
                <PercentageFormat value={r_0} decimals={2} />
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableHead className="font-bold pl-0 text-center border-r">
                Borrow Rate {poolInfo?.token_1?.token_symbol}
                <Help>The interest rate paid by borrowers to lenders.</Help>
              </TableHead>
              <TableCell className="font-bold text-center">
                <PercentageFormat value={r_1} decimals={2} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex justify-between mt-6">
          <div>
            Leverage
            <Help>The ratio of borrowed funds to collateral.</Help>
          </div>
          <div>
            <SecurdFormat value={leverage} decimals={2} prefix="&times;" />
          </div>
        </div>

        <Slider
          className="mt-4 px-2 mb-1"
          min={0}
          max={100}
          step={25}
          value={[
            (100 * (leverage - minLeverage)) / (sliderBase - minLeverage),
          ]}
          onValueChange={(value) => {
            if (value[0] === undefined) return;
            useAnalyticsAddressStore.setState({
              leverage:
                (value[0] * (sliderBase - minLeverage)) / 100 + minLeverage,
            });
          }}
        >
          <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-0">
            <span className="absolute top-5 text-xs">
              &times;{minLeverage.toFixed(1)}
            </span>
          </div>
          <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/4 -translate-x-1/4">
            <span className="absolute top-5 text-xs">
              &times;
              {(minLeverage + ((sliderBase ?? 0) - minLeverage) / 4).toFixed(1)}
            </span>
          </div>
          <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/2 -translate-x-1/2">
            <span className="absolute top-5 text-xs">
              &times;
              {(minLeverage + ((sliderBase ?? 0) - minLeverage) / 2).toFixed(1)}
            </span>
          </div>
          <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-1/4 translate-x-1/4">
            <span className="absolute top-5 text-xs">
              &times;
              {(
                minLeverage +
                (((sliderBase ?? 0) - minLeverage) * 3) / 4
              ).toFixed(1)}
            </span>
          </div>
          <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
            <span className="absolute top-5 text-xs">
              &times;{(sliderBase ?? 0).toFixed(1)}
            </span>
          </div>
        </Slider>
      </Card>
    </MenuTabsContent>
  );
}
