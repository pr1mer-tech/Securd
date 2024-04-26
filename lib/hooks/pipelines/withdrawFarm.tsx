import { ReserveInfo } from "@/lib/types/save.types";
import type { Config } from "wagmi";
import {
	getAccount,
	writeContract,
	waitForTransactionReceipt,
} from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import { SavePipelineState, savePipelineState2 } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { BaseError, TransactionRejectedRpcError, parseUnits } from "viem";
import {
	type CollateralPipelineState,
	releasePipelineState,
	withdrawPipelineState,
} from "./CollateralPipelineState";
import type { CollateralInfos } from "@/lib/types/farm.types";
import PairIcon from "@/components/farm/PairIcon";
import { getPairPrice, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import {
	formatPCTFactor,
	securdFormat,
} from "@/lib/helpers/numberFormat.helpers";
import { ArrowRight } from "lucide-react";

export function withdraw(
	config: Config,
	collateralInfo: CollateralInfos,
	amount: bigint,
	price: number,
	userDepositBalance: bigint,
	userBalance: bigint,
	callback: () => void,
): () => Effect<CollateralPipelineState> {
	return async function* withdrawPipeline() {
		yield releasePipelineState;

		// Check if we need to approve the token
		const account = getAccount(config);
		if (!account.address || amount <= 0n || userDepositBalance < amount) {
			yield releasePipelineState;
			return; // Restart the pipeline
		}

		yield {
			buttonEnabled: true,
			buttonLabel: "Release",
			buttonLoading: false,
		};

		yield {
			buttonEnabled: false,
			buttonLabel: "Releasing",
			buttonLoading: true,
		};

		const withdraw = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						// Deposit the token
						const hash = await writeContract(config, {
							abi: abiCollateralPool,
							address: process.env
								.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
							functionName: "withdraw",
							args: [collateralInfo.addressLP, amount, account.address!],
						});

						if (!hash) {
							throw new Error("Transaction rejected");
						}

						const receipt = await waitForTransactionReceipt(config, {
							hash,
						});

						if (receipt.status === "success") {
							return receipt;
						}
						throw new Error("Transaction reverted");
					},
					{
						loading: "Releasing...",
						success: (data) => {
							resolve();
							return "Released";
						},
						error: (error) => {
							reject(error);
							if (error instanceof BaseError) {
								return error.shortMessage;
							}
							if (error instanceof Error) {
								return `Error: ${error.message}`;
							}
							return "Error";
						},
					},
				);
			});

		const tokens = useFarmAddressStore.getState().reservesInfo;
		const _price = useFarmAddressStore.getState().collateralAmountPrice;
		const borrowerLt = useFarmAddressStore.getState().borrowerLt;
		const coinPrices = useFarmAddressStore.getState().coinPrices;
		const proportions = useFarmAddressStore.getState().collateralProportions;
		const borrowBalance = useFarmAddressStore.getState().borrowBalances();
		const leverage = useFarmAddressStore.getState().leverage();

		const tokensUSDPrices = getPairPrice(coinPrices, tokens, collateralInfo);

		const debt0 = parseUnits(
			borrowBalance?.borrowBalanceA.toString() ?? "0",
			tokens[0].decimals,
		);
		const debt1 = parseUnits(
			borrowBalance?.borrowBalanceB.toString() ?? "0",
			tokens[1].decimals,
		);

		const adjustedPriceA =
			debt0 * BigInt(Math.round((tokensUSDPrices.tokenA ?? 0) * 1e6 ?? 0));
		const adjustedPriceB =
			debt1 * BigInt(Math.round((tokensUSDPrices.tokenB ?? 0) * 1e6 ?? 0));

		const newCollateralFactor =
			((proportions?.collateralPrice ?? 0n) * (userDepositBalance - amount)) /
			(adjustedPriceA + adjustedPriceB);
		const newBorrowerLT =
			useFarmAddressStore
				.getState()
				.computeLT(
					bigIntToDecimal(adjustedPriceA, tokens[0].decimals + 6) ?? 0,
					bigIntToDecimal(adjustedPriceB, tokens[1].decimals + 6) ?? 0,
				) ?? 0;

		const collatPrice =
			bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ??
			0;
		const collateralDollar =
			(bigIntToDecimal(userDepositBalance - amount, collateralInfo.decimals) ??
				0) * collatPrice;
		const sumDebt =
			bigIntToDecimal(
				adjustedPriceA + adjustedPriceB,
				collateralInfo.decimals + 6,
			) ?? 0;
		const newLeverage = collateralDollar / (collateralDollar - sumDebt);

		const showImpact = new Promise<void>((resolve) => {
			useImpactStore.setState({
				open: true,
				title: "Confirm Release",
				transactionDetails: {
					title: "Release",
					amount,
					symbol: collateralInfo.symbol,
					decimals: collateralInfo.decimals,
					price: price,
				},
				impacts: [
					{
						label: "Balance",
						symbol: (
							<PairIcon
								userCollateralsInfo={collateralInfo}
								reservesInfo={tokens}
								size="tiny"
								symbol={false}
								className="translate-y-1"
							/>
						),
						fromAmount: userDepositBalance,
						toAmount: userDepositBalance - amount,
						fromDecimals: collateralInfo.decimals,
						toDecimals: collateralInfo.decimals,
						fromPrice: price,
						toPrice: price,
					},
				],
				note: (
					<>
						<div className="flex justify-between">
							<div className="w-36">Collateral Factor</div>
							<div className="w-12">
								{formatPCTFactor(
									bigIntToDecimal(
										_price?.collateralFactor,
										collateralInfo.decimals - 2,
									) ?? 0,
								)}
							</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{formatPCTFactor(
									bigIntToDecimal(
										newCollateralFactor,
										collateralInfo.decimals - 8,
									),
								)}
							</div>
						</div>
						<div className="flex justify-between">
							<div className="w-36">Liquidation Threshold</div>
							<div className="w-12">
								{formatPCTFactor(
									bigIntToDecimal(borrowerLt, collateralInfo.decimals - 2) ?? 0,
								)}
							</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{formatPCTFactor(newBorrowerLT * 100)}
							</div>
						</div>
						<div className="flex justify-between">
							<div className="w-36">Leverage</div>
							<div className="w-12">{securdFormat(leverage, 2)}x</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{securdFormat(newLeverage, 2)}x
							</div>
						</div>
					</>
				),
				action: async () => {
					try {
						await withdraw();
						callback();
					} catch (error) {
						console.error(error);
					}
				},
				finalize: () => {
					resolve();
				},
			});
		});
		await showImpact;
	};
}
