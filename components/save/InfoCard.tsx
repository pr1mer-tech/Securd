"use client";

import { useAccount } from "@/lib/hooks/bear/account";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ConnectKitButton } from "connectkit";
import { LoaderCircle } from "lucide-react";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import QuestionMark from "@/assets/icons/question-mark.svg";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import getUserTotalBalanceUSD from "@/lib/hooks/getUserTotalBalanceUSD";
import { useMemo } from "react";
import { useSaveStore } from "@/lib/data/saveStore";
import getTotalDeposit from "@/lib/hooks/getTotalDeposit";
import getTotalAverageApy from "@/lib/hooks/getTotalAverageApy";
import { Skeleton } from "../ui/skeleton";
import PercentageFormat from "../utils/PercentageFormat";
import SecurdFormat from "../utils/SecurdFormat";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";

export const Info = ({ bigIntValue, bigIntDecimals, value, name, type = "currency", tooltip, decimals = 2 }: {
    bigIntValue?: bigint, // Then value is the price
    bigIntDecimals?: number,
    value?: number,
    name: string,
    type?: "currency" | "percentage" | "multiplier"
    tooltip?: string,
    decimals?: number
}) => (

    <div className="flex flex-col items-center">
        <h3 className="text-base text-secondary">{name.toUpperCase()}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Image src={QuestionMark} alt="question mark" className="inline w-4 h-4 -mt-1 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </h3>
        <div className="text-3xl font-bold">
            {type === "percentage" && <PercentageFormat value={value} />}
            {(type === "currency" || type === "multiplier") && <SecurdFormat
                prefix={type === "currency" ? (!bigIntValue ? "$" : "") : "\u{00d7}"}
                value={bigIntValue ? bigIntToDecimal(bigIntValue, bigIntDecimals ?? 18) : value}
                decimals={decimals}
            />}
        </div>
        {typeof bigIntValue === "bigint" && <p className="text-sm text-secondary">${securdFormat(value, 0)}</p>}
    </div>
);

export default function InfoCard() {
    const { status } = useAccount();

    const reservesInfo = useSaveStore.use.reservesInfo();
    const coinPrices = useSaveStore.use.coinPrices();
    const balanceLDTokens = useSaveStore.use.balanceLDTokens();
    const userDeposit = useSaveStore.use.userDeposit();

    const { totalUserBalance } = getUserTotalBalanceUSD(reservesInfo, coinPrices, balanceLDTokens);
    const totalUserDeposit = getTotalDeposit(reservesInfo, userDeposit, coinPrices);

    const totalInterest = useMemo(() => {
        return totalUserBalance - totalUserDeposit;
    }, [totalUserBalance, totalUserDeposit]);

    const averageApy = getTotalAverageApy(reservesInfo, balanceLDTokens, coinPrices);

    if (!reservesInfo || !coinPrices) {
        return <Skeleton className="w-full rounded-xl h-24 max-w-screen-xl mx-auto" />;
    }

    return <>
        {(status === "connected" || status === "reconnecting") && <h2 className="text-xl font-bold text-white mt-4">Summary</h2>}
        <Card className="mt-4 p-4">
            {(status === "connected" || status === "reconnecting") ? <div className="flex flex-row justify-evenly">
                <Info value={totalUserBalance} name="balance" tooltip="Total Savings value (Deposit+Interest) in all your accounts" />
                <Info value={totalUserDeposit} name="deposit" tooltip="Total deposited amount in all your accounts" />
                <Info value={totalInterest} name="interest" tooltip="Total accrued interest in all your accounts" />
                <Info value={averageApy} name="average apy" type="percentage" tooltip="Current average yield in all your accounts" />
            </div> : <div className="text-center flex flex-col justify-center gap-4">
                <h3 className="text-lg font-bold">Start Saving</h3>
                <p className="text-base">
                    Connect your wallet to start saving today
                </p>
                <ConnectKitButton.Custom>
                    {({ show, truncatedAddress, ensName, isConnecting }) => {
                        return <Button onClick={show} className="mx-auto w-auto text-xl font-bold p-8">
                            {isConnecting && <LoaderCircle className="animate-spin" />}
                            Connect Wallet
                        </Button>
                    }}
                </ConnectKitButton.Custom>
            </div>}
        </Card>
    </>
}