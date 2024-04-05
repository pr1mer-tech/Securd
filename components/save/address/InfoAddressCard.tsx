"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccountTable } from "../AccountTable";
import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import getUserDepositBalance from "@/lib/hooks/getUserDepositBalance";
import { useEffect, useMemo, useState } from "react";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import Help from "@/components/ui/Help";
import { securdFormatFloor, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { MenuTabs, MenuTabsList, MenuTabsTrigger } from "@/components/ui/menu-tabs";
import { formatUnits, parseUnits } from "viem";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useValueEffect } from "@/lib/hooks/pipelines/useValueEffect";
import { deposit } from "@/lib/hooks/pipelines/deposit";
import { useConfig } from "wagmi";
import { SavePipelineState, savePipelineState } from "@/lib/hooks/pipelines/SavePipelineState";
import { withdraw } from "@/lib/hooks/pipelines/withdrawSave";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Impact from "@/components/layout/Impact";
import { cn } from "@/lib/utils";
import SecurdFormat from "@/components/utils/SecurdFormat";
import PercentageFormat from "@/components/utils/PercentageFormat";

export default function InfoAddressCard() {
    const reserveInfo = useSaveAddressStore.use.reserveInfo?.();
    const balanceLDToken = useSaveAddressStore.use.balanceLDToken?.();
    const coinPrice = useSaveAddressStore.use.coinPrice?.();
    const userDeposit = useSaveAddressStore.use.userDeposit?.();
    const userBalance = useSaveAddressStore.use.userBalance?.();

    const [menu, setMenu] = useState<"deposit" | "withdraw">("deposit");
    const [amount, setAmount] = useState<bigint>(0n);
    const [amountInput, setAmountInput] = useState<string>("");
    const resetInput = () => {
        setAmount(0n);
        setAmountInput("");
    }

    const savings = getSavingApy(reserveInfo);
    const userDepositBalance = balanceLDToken && getUserDepositBalance(reserveInfo, balanceLDToken);

    const sliderBase = menu === "deposit" ? userBalance : userDepositBalance;

    const config = useConfig();
    const [pipeline, nextStep, resetPipeline, setPipeline] = useValueEffect<SavePipelineState>(savePipelineState);

    useEffect(() => {
        if (reserveInfo) {
            setPipeline(menu === "deposit"
                ? deposit(config, reserveInfo, amount, coinPrice ?? 0, userDepositBalance ?? 0n, userBalance ?? 0n, resetInput)
                : withdraw(config, reserveInfo, amount, coinPrice ?? 0, userDepositBalance ?? 0n, resetInput));
        }
    }, [config, reserveInfo, amount, menu, userDepositBalance, setPipeline, coinPrice, userBalance]);

    const userInterest = useMemo(() => {
        const interest = getInterestAmount(
            userDepositBalance,
            userDeposit
        );

        return bigIntToDecimal(interest, reserveInfo?.decimals);
    }, [userDepositBalance, userDeposit, reserveInfo?.decimals]);

    if (!reserveInfo || !coinPrice || !balanceLDToken) {
        return <Skeleton className="w-full rounded-xl h-56 max-w-screen-xl mx-auto mt-8" />
    }

    return <div className="max-w-7xl mx-auto px-4">
        <Card className="flex flex-col md:flex-row mt-8">
            <div className="flex flex-col gap-2 bg-securdLightGrey rounded-t-2xl md:rounded-none md:rounded-l-2xl p-6 w-full md:w-2/5">
                <h2 className="text-2xl font-bold text-primary">My balance</h2>
                <Separator className="bg-securdWhite" />
                <div className="text-xl">
                    <AccountTable userDepositBalance={userDepositBalance} price={coinPrice} userDeposit={userDeposit} userReserveInfo={reserveInfo} userInterest={userInterest ?? 0} />
                </div>
            </div>
            <div className="flex flex-col gap-2 p-6 w-full md:w-3/5">
                <div className="flex flex-row justify-between items-center w-full">
                    <h2 className="text-2xl font-bold text-primary">Deposit / Withdraw</h2>
                    <div className="text-lg">
                        Savings APY

                        <Help>
                            Current yield for this account
                        </Help>
                        <PercentageFormat
                            className="text-2xl font-bold inline ml-2"
                            value={savings}
                        />
                    </div>
                </div>
                <Separator />
                <div className="flex flex-row justify-between items-center w-full">
                    <MenuTabs value={menu} onValueChange={(value) => {
                        setMenu(value as "deposit" | "withdraw");
                        resetInput();
                    }}>
                        <MenuTabsList className="h-[3.25rem]">
                            <MenuTabsTrigger value="deposit" className="p-6">Deposit</MenuTabsTrigger>
                            <MenuTabsTrigger value="withdraw" className="p-6">Withdraw</MenuTabsTrigger>
                        </MenuTabsList>
                    </MenuTabs>
                    {menu === "deposit" ? (<div className="text-md">
                        Wallet Balance
                        <Help>
                            Amount of this asset in your wallet
                        </Help>
                        <div className="inline-flex flex-col items-end">
                            <SecurdFormat
                                className="text-xl font-bold inline ml-2"
                                value={bigIntToDecimal(userBalance, reserveInfo.decimals)}
                                suffix={reserveInfo.symbol}
                            />
                            <SecurdFormat
                                className="text-sm inline text-secondary"
                                value={(bigIntToDecimal(userBalance, reserveInfo.decimals) ?? 0) * coinPrice}
                                prefix="$"
                            />
                        </div>
                    </div>) : (<div className="text-md">
                        Account Balance
                        <Help>
                            Amount of this asset in your Savings Account
                        </Help>
                        <div className="inline-flex flex-col items-end">
                            <SecurdFormat
                                className="text-xl font-bold inline ml-2"
                                value={bigIntToDecimal(userDepositBalance, reserveInfo.decimals)}
                                suffix={reserveInfo.symbol}
                            />
                            <SecurdFormat
                                className="text-sm inline text-secondary"
                                value={(bigIntToDecimal(userDepositBalance, reserveInfo.decimals) ?? 0) * coinPrice}
                                prefix="$"
                                decimals={0}
                            />
                        </div>
                    </div>)}
                </div>
                <div className="flex flex-row gap-4 mt-4">
                    <div className="relative flex items-center w-full">
                        <div className="absolute left-0 flex flex-row items-center justify-evenly border w-24 h-full bg-muted rounded-l-md">
                            <Image
                                className="rounded-full"
                                src={reserveInfo?.imgSrc}
                                alt={reserveInfo?.symbol}
                                width={20}
                                height={20} />
                            <div className="text-base font-bold">{reserveInfo?.symbol}</div>
                        </div>
                        <Input
                            placeholder="Amount"
                            type="number"
                            className="pl-28 h-12"
                            value={amountInput}
                            onChange={(e) => {
                                setAmountInput(e.target.value);
                                setAmount(parseUnits(Number(e.target.value).toString(), reserveInfo.decimals));
                            }}
                            onBlur={() => {
                                setAmountInput(formatUnits(amount, reserveInfo.decimals));
                            }}
                        />
                    </div>
                    <Button className="h-12 font-bold text-xl w-44" disabled={!pipeline.buttonEnabled} onClick={nextStep}>
                        {pipeline.buttonLabel}
                    </Button>
                </div>
                <Slider
                    className="mt-4"
                    min={0}
                    max={100}
                    step={25}
                    value={[sliderBase ? Math.round(Number(amount * 10000n / sliderBase)) / 100 : 0]}
                    onValueChange={(value) => {
                        if (!sliderBase) return;
                        const exactPercentage = value[0] ?? 0;
                        const amount = sliderBase * BigInt(exactPercentage) / 100n;

                        setAmount(amount);
                        setAmountInput(formatUnits(amount, reserveInfo.decimals));
                    }}
                >
                    <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-0">
                        <span className="absolute top-5 text-xs">0%</span>
                    </div>
                    <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/4 -translate-x-1/4">
                        <span className="absolute top-5 text-xs">25%</span>
                    </div>
                    <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/2 -translate-x-1/2">
                        <span className="absolute top-5 text-xs">50%</span>
                    </div>
                    <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-1/4 translate-x-1/4">
                        <span className="absolute top-5 text-xs">75%</span>
                    </div>
                    <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
                        <span className="absolute top-5 text-xs">100%</span>
                    </div>
                </Slider>
            </div>
            <Impact />
        </Card>
    </div>
}