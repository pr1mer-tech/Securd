"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import PairIcon from "@/components/farm/PairIcon";

export default function FarmAddressTitle() {
    const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
    const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
    return <>
        {collateralInfo ? <>
            <PairIcon userCollateralsInfo={collateralInfo} size="normal" reservesInfo={reservesInfo} className="text-white font-bold text-xl" />
        </> : <Skeleton className="w-20 h-10 rounded-full" />}
    </>;
}
