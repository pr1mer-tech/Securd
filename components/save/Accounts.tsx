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


export default function Accounts() {

    const reservesInfo = useSaveStore.use.reservesInfo();
    const balanceLDTokens = useSaveStore.use.balanceLDTokens();

    const userReservesInfo = getUserReservesInfo(reservesInfo, balanceLDTokens);

    return <>
        <h2 className="text-xl font-bold mt-4">My Accounts ({userReservesInfo.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {userReservesInfo?.map(
                (userReserveInfo: ReserveInfo, key: number) => (
                    <AccountCard key={key} userReserveInfo={userReserveInfo} />
                ))}
        </div>
    </>
}