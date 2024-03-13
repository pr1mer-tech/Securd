"use client";

import getUserReservesInfo from "@/lib/hooks/getUserReservesInfo";
import { ReserveInfo } from "@/lib/types/save.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import QuestionMark from "@/assets/icons/question-mark.svg";
import { useSaveStore } from "@/lib/data/saveStore";
import {
    TableCaption,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";
import { useFarmStore } from "@/lib/data/farmStore";
import getUserCollateralsInfos from "@/lib/hooks/getUserCollateralsInfos";
import { CollateralInfos } from "@/lib/types/farm.types";
import { AccountCard } from "./AccountCard";


export default function Accounts() {

    const collateralsInfos = useFarmStore.use.collateralsInfos();
    const collateralAmountPrice = useFarmStore.use.collateralAmountPrice();

    const userCollateralsInfos = getUserCollateralsInfos(collateralsInfos, collateralAmountPrice);

    return <>
        <div className={cn("relative before:absolute before:inset-0 before:bg-securdPrimaryLight before:-top-[4.3rem] before:w-full before:z-[-1] pb-4",
            userCollateralsInfos.length > 0 ? "before:h-[calc(100%+4.25rem)]" : "before:h-0"
        )}>
            <div className="max-w-7xl mx-auto px-4">
                {userCollateralsInfos.length > 0 && <h2 className="text-xl font-bold mt-4">My Accounts ({userCollateralsInfos.length})</h2>}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                >
                    {userCollateralsInfos?.map(
                        (userCollateralInfo: CollateralInfos, key: number) => (
                            <AccountCard key={key} userCollateralsInfo={userCollateralInfo} collateralAmountPrices={collateralAmountPrice} />
                        ))}
                </div>
            </div>
        </div>
    </>
}