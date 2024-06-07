import { formatPCTFactor, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function PercentageFormat({
	value,
	className,
	decimals = 2,
	prefix = "",
	suffix = "",
	description = "",
	factor = false,
}: {
	value?: number;
	className?: string;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	description?: string;
	factor?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger className={className}>
				{`${prefix} ${factor ? formatPCTFactor(value ? value * 100 : undefined, decimals) : toFormattedPercentage(value, decimals)} ${suffix}`}
			</TooltipTrigger>
			<TooltipContent>
				{description}
				{`${prefix} ${(value ?? 0) * 100}% ${suffix}`}
			</TooltipContent>
		</Tooltip>
	);
}
