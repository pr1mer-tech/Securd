import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createSelectors } from "@/lib/data/createSelectors";
import { create } from "zustand";
import { Separator } from "../ui/separator";
import React from "react";
import { securdFormatFloor } from "@/lib/helpers/numberFormat.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { ArrowRight } from "lucide-react";

export type TransactionDetails = {
    title: string;
    amount: bigint;
    symbol: string;
    decimals: number;
    price: number;
}

export type AccountImpact = {
    label: React.ReactNode;
    fromAmount: bigint;
    toAmount: bigint;
    fromDecimals: number;
    toDecimals: number;
    fromPrice: number;
    toPrice: number;
}

export type ImpactState = {
    open: boolean;
    title?: string;
    transactionDetails?: TransactionDetails;
    impacts?: AccountImpact[];
    action?: () => Promise<void>;
    finalize?: () => void;
}

const useImpactStoreBase = create<ImpactState>((set) => ({
    open: false,
    title: undefined,
    transactionDetails: undefined,
    impacts: undefined,
    action: undefined,
    finalize: undefined,
}));

export const useImpactStore = createSelectors(useImpactStoreBase);

export default function Impact() {
    const open = useImpactStore.use.open();
    const title = useImpactStore.use.title?.();
    const transactionDetails = useImpactStore.use.transactionDetails?.();
    const impacts = useImpactStore.use.impacts?.();
    const action = useImpactStore.use.action?.();
    const finalize = useImpactStore.use.finalize?.();

    const [busy, setBusy] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (busy) return;
            useImpactStore.setState({ open });
            finalize?.();
        }}>
            <DialogContent className="p-0 gap-0 max-w-xl">
                <DialogHeader className="border-b">
                    <DialogTitle className="text-center pt-4 pb-3">{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="flex flex-row text-black">
                    <div className="flex flex-col w-full p-3">
                        <h3 className="text-center text-lg font-bold">Transaction Details</h3>
                        <Separator className="my-2" />
                        <div className="flex flex-row justify-between">
                            <div className="font-bold">{transactionDetails?.title}</div>
                            <div className="flex flex-col items-end">
                                <div className="font-bold inline ml-2">
                                    {securdFormatFloor(bigIntToDecimal(transactionDetails?.amount, transactionDetails?.decimals), 2)}
                                    {" " + transactionDetails?.symbol}
                                </div>
                                <div className="text-sm text-secondary">
                                    ${securdFormatFloor(transactionDetails && (
                                        (bigIntToDecimal(transactionDetails?.amount, transactionDetails?.decimals) ?? 0) * transactionDetails.price)
                                        , 2)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col w-full p-3">
                        <h3 className="text-center text-lg font-bold">Impact on my account</h3>
                        <Separator className="my-2" />
                        {impacts?.map((impact, index) => (
                            <div key={index} className="flex flex-row justify-between">
                                <div className="font-bold">{impact.label}</div>
                                <div className="flex flex-col items-end">
                                    <div className="font-bold inline ml-2">
                                        {securdFormatFloor(bigIntToDecimal(impact.fromAmount, impact.fromDecimals), 2)}
                                        {" " + transactionDetails?.symbol}
                                    </div>
                                    <div className="text-sm text-secondary">
                                        ${securdFormatFloor((bigIntToDecimal(impact.fromAmount, impact.fromDecimals) ?? 0 * impact.fromPrice), 2)}
                                    </div>
                                </div>
                                <ArrowRight className="w-6 h-6" />
                                <div className="flex flex-col items-end">
                                    <div className="font-bold inline ml-2">
                                        {securdFormatFloor(bigIntToDecimal(impact.toAmount, impact.toDecimals), 2)}
                                        {" " + transactionDetails?.symbol}
                                    </div>
                                    <div className="text-sm text-secondary">
                                        ${securdFormatFloor((bigIntToDecimal(impact.toAmount, impact.toDecimals) ?? 0 * impact.toPrice), 2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogDescription>
                <DialogFooter className="flex flex-row p-3 mt-2">
                    <Button
                        className="w-full bg-white text-securdPrimary border-2 border-securdPrimary"
                        disabled={busy}
                        onClick={() => {
                            useImpactStore.setState({ open: false });
                            finalize?.();
                        }}>Cancel</Button>
                    <Button
                        className="w-full"
                        disabled={busy}
                        onClick={async () => {
                            try {
                                setBusy(true);
                                await action?.()
                                useImpactStore.setState({ open: false });
                                setBusy(false);
                                finalize?.();
                            } catch (error) {
                                console.error(error);
                                setBusy(false);
                            }
                        }}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}