import { toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function PercentageFormat({
    value,
    className,
    decimals = 2,
    prefix = "",
    suffix = ""
}: {
    value?: number;
    className?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string
}) {
    return <Tooltip>
        <TooltipTrigger className={className}>
            {`${prefix} ${toFormattedPercentage(value, decimals)} ${suffix}`}
        </TooltipTrigger>
        <TooltipContent>
            {`${prefix} ${value} ${suffix}`}
        </TooltipContent>
    </Tooltip>
}