"use client";

import getUserReservesInfo from "@/lib/hooks/getUserReservesInfo";
import { ReserveInfo } from "@/lib/types/save.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import QuestionMark from "@/assets/icons/question-mark.svg";
import { useSaveStore } from "@/lib/data/saveStore";
import {
    TableCaption,
} from "@/components/ui/table"
import { AccountCard } from "./AccountCard";
import { cn } from "@/lib/utils";


export default function Accounts() {

    const reservesInfo = useSaveStore.use.reservesInfo();
    const balanceLDTokens = useSaveStore.use.balanceLDTokens();

    const userReservesInfo = getUserReservesInfo(reservesInfo, balanceLDTokens);

    return <>
        <div className="absolute inset-0 z-[-1]">
            <div className="bg-primary w-full h-44" />
        </div>
        <div className={cn("relative before:absolute before:inset-0 before:bg-securdPrimaryLight before:-top-[4.3rem] before:w-full before:z-[-1] pb-4",
            userReservesInfo.length > 0 ? "before:h-[calc(100%+4.25rem)]" : "before:h-0"
        )}>
            <div className="max-w-7xl mx-auto px-4">
                {userReservesInfo.length > 0 && <h2 className="text-xl font-bold mt-4">My Accounts ({userReservesInfo.length})</h2>}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                >
                    {userReservesInfo?.map(
                        (userReserveInfo: ReserveInfo, key: number) => (
                            <AccountCard key={key} userReserveInfo={userReserveInfo} />
                        ))}
                </div>
            </div>
        </div>
    </>
}