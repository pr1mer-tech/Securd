import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { CustomTooltipProps } from "@tremor/react";

export const customTooltip = (props: CustomTooltipProps) => {
    const { payload, active, label } = props;
    if (!active || !payload) return null;
    const payloadObj = Object.fromEntries(payload.map((category) => [category.dataKey, category.value]));
    const lpVsHold = payloadObj["LP"] / payloadObj["HOLD"];

    if (payload.length !== 3) {
        payload.push({
            dataKey: "LP/HOLD",
            value: lpVsHold,
            color: "#fcd34d"
        });
    }

    return (
        <div className="rounded-tremor-default text-tremor-default border bg-tremor-background shadow-tremor-dropdown border-tremor-border">
            <div
                className="border-tremor-border border-b px-4 py-2"
            >
                <p
                    className="font-medium text-tremor-content-emphasis"
                >
                    {label}
                </p>
            </div>
            <div className="px-4 py-2 space-y-1">
                {payload.map((category, idx) => (
                    <div key={idx} className="flex items-center justify-between space-x-8">
                        <div className="flex items-center space-x-2">
                            <span
                                className="shrink-0 rounded-tremor-full border-2 h-3 w-3 border-tremor-background shadow-tremor-card"
                                style={{ backgroundColor: category.color }}
                            />
                            <p
                                className="text-right whitespace-nowrap text-tremor-content"
                            >
                                {category.dataKey}
                            </p>
                        </div>
                        <p
                            className="font-medium tabular-nums text-right whitespace-nowrap text-tremor-content-emphasis"
                        >
                            {category.dataKey === "LP/HOLD"
                                ? <PercentageFormat value={lpVsHold} />
                                : <SecurdFormat
                                    value={category.value as number}
                                    decimals={2}
                                    prefix="$"
                                />}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};