import { useFarmStore } from "@/lib/data/farmStore";
import { getPairReservesInfos, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import UniswapLogo from "@/assets/logos/Uniswap-logo.svg";
import { CollateralInfos, PoolType, poolLink } from "@/lib/types/farm.types";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";

export function DexIcon({
    userCollateralsInfo,
    className,
    width,
    height,
}: {
    userCollateralsInfo: CollateralInfos,
    className?: string,
    width: number,
    height: number
}) {
    return <>
        {userCollateralsInfo.poolType === PoolType.UniswapV2 && (
            <Image
                className={className}
                src={UniswapLogo}
                alt="uni"
                width={width}
                height={height}
            />
        )}
    </>
}

export default function PairIcon({ userCollateralsInfo }: { userCollateralsInfo: CollateralInfos }) {
    const reservesInfo = useFarmStore.use.reservesInfo();

    const tokensUn = getTokensSymbol(userCollateralsInfo);
    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokensUn);

    if (!pairReservesInfosUn.reserveInfoTokenA || !pairReservesInfosUn.reserveInfoTokenB) {
        return <Skeleton className="w-8 h-6" />
    }

    return <Tooltip>
        <TooltipTrigger>
            <div className="flex items-center">
                <div className="relative flex items-center">
                    <Image
                        className="rounded-full"
                        src={pairReservesInfosUn.reserveInfoTokenA?.imgSrc}
                        alt={pairReservesInfosUn.reserveInfoTokenA?.symbol}
                        width={32}
                        height={32}
                    />
                    <Image
                        className="rounded-full -ml-2 border-2 border-white"
                        src={pairReservesInfosUn.reserveInfoTokenB?.imgSrc}
                        alt={pairReservesInfosUn.reserveInfoTokenB?.symbol}
                        width={32}
                        height={32}
                    />
                    <DexIcon
                        className="absolute right-0 bottom-0 translate-x-1 translate-y-1 rounded-full bg-white"
                        userCollateralsInfo={userCollateralsInfo}
                        width={16}
                        height={16}
                    />
                </div>
                {userCollateralsInfo.symbol}
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <Link href={poolLink(userCollateralsInfo.poolType, userCollateralsInfo.addressLP)} target="_blank" onClick={(e) => e.stopPropagation()}>
                <DexIcon
                    className="inline mr-1"
                    userCollateralsInfo={userCollateralsInfo}
                    width={24}
                    height={24}
                />
                View on {userCollateralsInfo.poolType}
            </Link>
        </TooltipContent>
    </Tooltip>
}