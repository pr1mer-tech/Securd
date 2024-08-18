"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { createSelectors } from "@/lib/data/createSelectors";
import { create } from "zustand";
import { Separator } from "../ui/separator";
import React from "react";
import { securdFormatFloor } from "@/lib/helpers/numberFormat.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { ArrowRight, LoaderIcon } from "lucide-react";
import { Card } from "../ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSimulateContract } from "wagmi";
import type { BaseError } from "viem";

export type TransactionDetails = {
	title: React.ReactNode;
	amount: bigint;
	symbol: React.ReactNode;
	decimals: number;
	price: number;
};

export type AccountImpact = {
	label: React.ReactNode;
	symbol?: React.ReactNode;
	type?: "balance" | "loan";
	fromAmount: bigint;
	toAmount: bigint;
	fromDecimals: number;
	toDecimals: number;
	fromPrice: number;
	toPrice: number;
};

export type ImpactState = {
	open: boolean;
	title?: string;
	transactionDetails?: TransactionDetails;
	impacts?: AccountImpact[];
	note?: React.ReactNode;
	simulate: object;
	action?: () => Promise<void>;
	finalize?: () => void;
};

const baseState: ImpactState = {
	open: false,
	title: undefined,
	transactionDetails: undefined,
	impacts: undefined,
	note: undefined,
	action: undefined,
	finalize: undefined,
	simulate: {},
};

const useImpactStoreBase = create<ImpactState>((set) => baseState);

export const useImpactStore = createSelectors(useImpactStoreBase);

export default function Impact() {
	const open = useImpactStore.use.open();
	const title = useImpactStore.use.title?.();
	const transactionDetails = useImpactStore.use.transactionDetails?.();
	const impacts = useImpactStore.use.impacts?.();
	const action = useImpactStore.use.action?.();
	const finalize = useImpactStore.use.finalize?.();
	const note = useImpactStore.use.note?.();
	const simulate = useImpactStore.use.simulate?.();

	const [busy, setBusy] = React.useState(false);

	const queryClient = useQueryClient();

	const simulateContract = useSimulateContract({
		...simulate,
		query: {
			enabled: Object.keys(simulate).length > 0,
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (busy) return;
				useImpactStore.setState({ open });
				if (finalize && !open) {
					finalize();
					queryClient.invalidateQueries();
				}
				if (open === false) {
					useImpactStore.setState(baseState); // Reset state
				}
			}}
		>
			<DialogContent className="p-0 gap-0 max-w-2xl">
				<DialogHeader className="border-b">
					<DialogTitle className="text-center pt-4 pb-3">{title}</DialogTitle>
				</DialogHeader>
				<DialogDescription className="flex flex-row text-black">
					<div className="flex flex-col w-full p-3">
						<h3 className="text-center text-lg font-bold">
							Transaction Details
						</h3>
						<Separator className="my-2" />
						<div className="flex flex-row justify-between">
							<div className="font-bold">{transactionDetails?.title}</div>
							<div className="flex flex-col items-end">
								<div className="font-bold inline ml-2">
									{securdFormatFloor(
										bigIntToDecimal(
											transactionDetails?.amount,
											transactionDetails?.decimals,
										),
										2,
									)}{" "}
									{transactionDetails?.symbol}
								</div>
								<div className="text-sm text-secondary">
									$
									{securdFormatFloor(
										transactionDetails &&
											(bigIntToDecimal(
												transactionDetails?.amount,
												transactionDetails?.decimals,
											) ?? 0) * transactionDetails.price,
										0,
									)}
								</div>
							</div>
						</div>
					</div>
					<Separator orientation="vertical" />
					<div className="flex flex-col w-full p-3 gap-2">
						<h3 className="text-center text-lg font-bold">
							Impact on my account
						</h3>
						<Separator />
						{impacts?.map((impact) => (
							<div
								key={impact.label?.toLocaleString()}
								className="flex flex-row justify-between"
							>
								<div className="font-bold">{impact.label}</div>
								<div className="flex flex-col items-end whitespace-nowrap">
									<div
										className={cn(
											"font-bold inline ml-2",
											impact.type === "loan" && "text-red-500",
										)}
									>
										{impact.type === "loan" && "(-"}
										{securdFormatFloor(
											bigIntToDecimal(impact.fromAmount, impact.fromDecimals),
											2,
										)}{" "}
										{impact.symbol ?? transactionDetails?.symbol}
										{impact.type === "loan" && ")"}
									</div>
									<div className="text-sm text-secondary">
										$
										{securdFormatFloor(
											(bigIntToDecimal(
												impact.fromAmount,
												impact.fromDecimals,
											) ?? 0) * impact.fromPrice,
											0,
										)}
									</div>
								</div>
								<ArrowRight className="w-6 h-6" />
								<div className="flex flex-col items-end whitespace-nowrap">
									<div
										className={cn(
											"font-bold inline ml-2",
											impact.type === "loan" && "text-red-500",
										)}
									>
										{impact.type === "loan" && "(-"}
										{securdFormatFloor(
											bigIntToDecimal(impact.toAmount, impact.toDecimals),
											2,
										)}{" "}
										{impact.symbol ?? transactionDetails?.symbol}
										{impact.type === "loan" && ")"}
									</div>
									<div className="text-sm text-secondary">
										$
										{securdFormatFloor(
											(bigIntToDecimal(impact.toAmount, impact.toDecimals) ??
												0) * impact.toPrice,
											0,
										)}
									</div>
								</div>
							</div>
						))}
						{note && <Card className="p-3">{note}</Card>}
					</div>
				</DialogDescription>
				{simulateContract.error && (
					<>
						<Card className="p-3 bg-red-200 border-red-500 text-sm m-2">
							{(simulateContract.error as BaseError).shortMessage}
						</Card>
					</>
				)}
				<DialogFooter className="flex flex-row p-3 mt-2 gap-2">
					<Button
						className="w-full bg-white text-securdPrimary border-2 border-securdPrimary"
						disabled={busy}
						onClick={() => {
							useImpactStore.setState({ open: false });
							finalize?.();
						}}
					>
						Cancel
					</Button>
					<Button
						className="w-full"
						disabled={busy || !simulateContract.data}
						onClick={async () => {
							try {
								setBusy(true);
								await action?.();
								useImpactStore.setState({ open: false });
								setBusy(false);
								finalize?.();
							} catch (error) {
								console.error(error);
								setBusy(false);
							}
						}}
					>
						{(busy || !simulateContract.data) && !simulateContract.error && (
							<LoaderIcon className="w-4 h-4 animate-spin mr-1" />
						)}
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
