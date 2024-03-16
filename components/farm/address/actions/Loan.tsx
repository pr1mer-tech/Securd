"use client";

import Help from "@/components/ui/Help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuTabs, MenuTabsList, MenuTabsTrigger } from "@/components/ui/menu-tabs";
import { Slider } from "@/components/ui/slider";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import PairIcon from "../../PairIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "wagmi";
import { useValueEffect } from "@/lib/hooks/pipelines/useValueEffect";
import { CollateralPipelineState, borrowPipelineState, lockPipelineState } from "@/lib/hooks/pipelines/CollateralPipelineState";
import { lock } from "@/lib/hooks/pipelines/lock";
import { withdraw } from "@/lib/hooks/pipelines/withdrawFarm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPairReservesInfos, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import Image from "next/image";
import { borrow } from "@/lib/hooks/pipelines/borrow";
import { repay } from "@/lib/hooks/pipelines/repay";

export default function Loan() {
    const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
    const collateralAmountPrice = useFarmAddressStore.use.collateralAmountPrice?.();
    const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
    const userBalance = useFarmAddressStore.use.userBalance?.();
    const coinsPrices = useFarmAddressStore.use.coinPrices?.();

    const tokens = getTokensSymbol(collateralInfo);

    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokens);

    const borrowBalances = getPairBorrowBalances(
        collateralAmountPrice?.debts,
        pairReservesInfosUn.reserveInfoTokenA,
        pairReservesInfosUn.reserveInfoTokenB
    );

    const [menu, setMenu] = useState<"borrow" | "repay">("borrow");
    const [selectedAsset, setSelectedAsset] = useState<string>(tokens[0]);
    const [amount, setAmount] = useState<bigint>(0n);
    const [amountInput, setAmountInput] = useState<string>("");
    const resetInput = () => {
        setAmount(0n);
        setAmountInput("");
    }

    const config = useConfig();
    const [pipeline, nextStep, resetPipeline, setPipeline] = useValueEffect<CollateralPipelineState>(borrowPipelineState);

    useEffect(() => {
        if (borrowBalances && collateralInfo && collateralAmountPrice && pairReservesInfosUn.reserveInfoTokenA && pairReservesInfosUn.reserveInfoTokenB) {
            const price = bigIntToDecimal(collateralAmountPrice.collateralAmount, collateralInfo.decimals);
            const asset = selectedAsset === tokens[0] ? pairReservesInfosUn.reserveInfoTokenA : pairReservesInfosUn.reserveInfoTokenB;

            setPipeline(menu === "borrow"
                ? borrow(config, collateralInfo, asset, amount, price ?? 0, coinsPrices, collateralAmountPrice.collateralAmount ?? 0n, [pairReservesInfosUn.reserveInfoTokenA, pairReservesInfosUn.reserveInfoTokenB], borrowBalances, resetInput)
                : repay(config, collateralInfo, asset, amount, price ?? 0, coinsPrices, collateralAmountPrice.collateralAmount ?? 0n, [pairReservesInfosUn.reserveInfoTokenA, pairReservesInfosUn.reserveInfoTokenB], borrowBalances, resetInput)
            );
        }
    }, [config, amount, menu, setPipeline, collateralInfo, collateralAmountPrice, userBalance]);

    const sliderBase = menu === "borrow" ? collateralAmountPrice?.collateralAmount : parseUnits((
        (tokens[0] === selectedAsset ? borrowBalances?.borrowBalanceA : borrowBalances?.borrowBalanceB) ?? "0"
    ).toString(), collateralInfo?.decimals ?? 18);

    return <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row justify-between items-center w-full h-10">
            <h2 className="text-2xl font-bold text-primary">Loan</h2>
            <Tabs value={selectedAsset} onValueChange={(value) => {
                setSelectedAsset(value as string);
            }}>
                <TabsList>
                    {tokens.map((token, index) => (
                        <TabsTrigger key={token} value={token}>
                            {token}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
        <Separator />
        <div className="flex flex-row justify-between items-center w-full">
            <MenuTabs value={menu} onValueChange={(value) => {
                setMenu(value as "borrow" | "repay");
                resetInput();
            }}>
                <MenuTabsList className="h-[3.25rem]">
                    <MenuTabsTrigger value="borrow" className="p-6">Borrow</MenuTabsTrigger>
                    <MenuTabsTrigger value="repay" className="p-6">Repay</MenuTabsTrigger>
                </MenuTabsList>
            </MenuTabs>
            {menu === "borrow" ? (<div className="text-md">
                Collateral Balance
                <Help>
                    Value of locked assets backing your loans in this account
                </Help>
                <SecurdFormat
                    className="text-xl font-bold inline ml-2"
                    value={bigIntToDecimal(collateralAmountPrice?.collateralAmount, collateralInfo?.decimals)}
                />
                {collateralInfo
                    ? <PairIcon reservesInfo={reservesInfo} userCollateralsInfo={collateralInfo} size="small" symbol={false} className="translate-y-[0.375rem] ml-1" />
                    : <Skeleton className="w-8 h-6" />}
            </div>) : (<div className="text-md">
                Loan Balance
                <Help>
                    Value of {selectedAsset} loan in this account
                </Help>
                <SecurdFormat
                    className="text-xl font-bold inline ml-2"
                    value={bigIntToDecimal(sliderBase, collateralInfo?.decimals)}
                />
                {pairReservesInfosUn.reserveInfoTokenA && pairReservesInfosUn.reserveInfoTokenB && <Image
                    src={selectedAsset === tokens[0] ? pairReservesInfosUn.reserveInfoTokenA?.imgSrc : pairReservesInfosUn.reserveInfoTokenB?.imgSrc}
                    alt={selectedAsset}
                    width={24}
                    height={24}
                    className="inline -mt-1 ml-1"
                />}
            </div>)}
        </div>
        <div className="flex flex-row gap-4 mt-4">
            <div className="relative flex items-center w-full">
                <div className="absolute left-0 flex flex-row items-center justify-evenly border w-24 h-full bg-muted rounded-l-md">
                    {collateralInfo
                        ? <PairIcon reservesInfo={reservesInfo} userCollateralsInfo={collateralInfo} size="small" symbol={false} />
                        : <Skeleton className="w-8 h-6" />}
                </div>
                <Input
                    placeholder="Amount"
                    type="number"
                    className="pl-28 h-12"
                    value={amountInput}
                    onChange={(e) => {
                        setAmountInput(e.target.value);
                        setAmount(parseUnits(Number(e.target.value).toString(), collateralInfo?.decimals ?? 18));
                    }}
                    onBlur={() => {
                        setAmountInput(formatUnits(amount, collateralInfo?.decimals ?? 18));
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
                const _exactPercentage = value[0] ?? 0;
                const exactPercentage = (_exactPercentage > 80 && menu == "borrow") ? 80 : _exactPercentage;
                const amount = sliderBase * BigInt(exactPercentage) / 100n;

                setAmount(amount);
                setAmountInput(formatUnits(amount, collateralInfo?.decimals ?? 18));
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
            {menu === "borrow" && <div className="absolute h-5 w-1/5 right-0 flex items-center">
                <div className="absolute h-2 w-full bg-red-500 rounded-full" />
            </div>}
            <div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
                <span className="absolute top-5 text-xs">100%</span>
            </div>
        </Slider>
    </div>
}