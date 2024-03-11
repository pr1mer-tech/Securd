"use client";

import Image from "next/image";
import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function SaveAddressTitle() {
    const reserveInfo = useSaveAddressStore.use.reserveInfo?.();
    return <>
        {reserveInfo ? <><Image
            className="rounded-full inline"
            src={reserveInfo?.imgSrc}
            alt={reserveInfo?.symbol}
            width={40}
            height={40} />
            <div className="ml-2 text-xl font-bold text-white">{reserveInfo?.symbol}</div>
        </> : <Skeleton className="w-20 h-10 rounded-full" />}
    </>;
}
