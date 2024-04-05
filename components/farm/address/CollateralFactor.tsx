"use client";

import Help from "@/components/ui/Help";
import { Slider } from "@/components/ui/slider";
import PercentageFormat from "@/components/utils/PercentageFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import { getLiquidationThresholdForToken } from "@/lib/helpers/borrow.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";

export default function CollateralFactor() {
    const { collateralFactor, borrowerLt, computeLT } = useFarmAddressStore((state) => ({
        collateralFactor: state.collateralFactor(),
        borrowerLt: bigIntToDecimal(state.borrowerLt, state.collateralInfo?.decimals ?? 0),
        computeLT: state.computeLT()
    }));

    const colorRisk = 100 * ((collateralFactor ?? 0) / (borrowerLt ?? 2) - 1);
    let color;
    if (colorRisk && colorRisk <= 10) {
        color = 'bg-systemRed';
    } else if (colorRisk && colorRisk <= 25) {
        color = 'bg-systemYellow';
    } else {
        color = 'bg-systemGreen';
    }

    return <div className="mx-4">
        <Slider
            className="my-8"
            rangeClassName={color}
            min={0}
            max={Math.max(collateralFactor ?? 0, borrowerLt ?? 0) * 100}
            value={collateralFactor && borrowerLt ? [
                (collateralFactor ?? 0) * 100,
                (borrowerLt ?? 0) * 100
            ] : []}
            thumbs={[
                <span key={0} className="absolute -top-6 w-12 -translate-x-6 text-center">
                    CF
                    <Help>
                        Collateral Factor (Collateral value divided by Loan value)
                    </Help>
                    <PercentageFormat value={collateralFactor} className="mt-6" />
                </span>,
                <span key={1} className="absolute -top-6 w-12 -translate-x-6 text-center">
                    LT
                    <Help>
                        Liquidation Threshold (Minimum Collateral Factor before your collateral is liquidated)
                    </Help>
                    <PercentageFormat value={borrowerLt} className="mt-6" />
                </span>
            ]}
        />
    </div>
}