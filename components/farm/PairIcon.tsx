"use client";

import { getPairReservesInfos, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import UniswapLogo from "@/assets/logos/Uniswap-logo.svg";
import { CollateralInfos, PoolType, poolLink } from "@/lib/types/farm.types";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ReserveInfo } from "@/lib/types/save.types";

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

export default function PairIcon({
    className,
    userCollateralsInfo,
    reservesInfo,
    symbol = true,
    size = "normal", // Default size is set to "normal" if not provided
}: {
    className?: string;
    userCollateralsInfo: CollateralInfos;
    reservesInfo?: ReserveInfo[];
    symbol?: boolean;
    size?: "tiny" | "small" | "normal" | "large";
}) {
    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, userCollateralsInfo);

    if (!pairReservesInfosUn.reserveInfoTokenA || !pairReservesInfosUn.reserveInfoTokenB) {
        return userCollateralsInfo?.token_0
        //<Skeleton className="w-8 h-6" />
    }

    // Define size mappings for width and height
    const sizeMappings = {
        tiny: { width: 18, height: 18 },
        small: { width: 24, height: 24 },
        normal: { width: 32, height: 32 },
        large: { width: 48, height: 48 },
    };

    // Get the width and height based on the size prop
    const { width, height } = sizeMappings[size];

    return <Tooltip>
        <TooltipTrigger className={className}>
            <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                    <Image
                        className="rounded-full"
                        src={pairReservesInfosUn.reserveInfoTokenA?.imgSrc}
                        alt={pairReservesInfosUn.reserveInfoTokenA?.symbol}
                        width={width}
                        height={height}
                        onError={(e) => console.error(e)}
                    />
                    <Image
                        className="rounded-full -ml-2 border-2 border-white bg-white"
                        src={pairReservesInfosUn.reserveInfoTokenB?.imgSrc}
                        alt={pairReservesInfosUn.reserveInfoTokenB?.symbol}
                        width={width}
                        height={height}
                        onError={(e) => console.error(e)}
                    />
                    <DexIcon
                        className="absolute right-0 bottom-0 translate-x-1 translate-y-1 rounded-full bg-white"
                        userCollateralsInfo={userCollateralsInfo}
                        width={width / 2} // Adjust DexIcon size based on the parent size
                        height={height / 2} // Adjust DexIcon size based on the parent size
                    />
                </div>
                {symbol && userCollateralsInfo.symbol}
            </div>
        </TooltipTrigger>
        <TooltipContent className="font-bold">
            <Link href={poolLink(userCollateralsInfo.poolType, userCollateralsInfo.addressLP)} target="_blank" onClick={(e) => e.stopPropagation()} className="hover:underline">
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