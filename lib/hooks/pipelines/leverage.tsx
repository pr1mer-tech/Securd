import type { Config } from "wagmi";
import {
	getAccount,
	writeContract,
	waitForTransactionReceipt,
	readContract,
	getGasPrice,
} from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import {
	Address,
	BaseError,
	TransactionRejectedRpcError,
	parseUnits,
} from "viem";
import {
	type CollateralPipelineState,
	borrowPipelineState,
	leveragePipelineState,
	withdrawPipelineState,
} from "./CollateralPipelineState";
import type { CollateralInfos } from "@/lib/types/farm.types";
import type { Coins, ReserveInfo } from "@/lib/types/save.types";
import {
	getBorrowerMaxLeverage,
	getBorrowerPoolBalanceLT,
	getBorrowerPoolMaxLeverage,
	getMaxLT,
	getPairPrice,
	getTokensSymbol,
} from "@/lib/helpers/borrow.helpers";
import type { CollateralAmountPrice } from "../wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { leverageToLp } from "@/lib/helpers/borrower.helpers";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import PairIcon from "@/components/farm/PairIcon";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
	formatPCTFactor,
	securdFormat,
} from "@/lib/helpers/numberFormat.helpers";
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";
import { collateralPoolContract } from '@/lib/constants/wagmiConfig/wagmiConfig';

export function leverage(
	config: Config,
	collateralInfo: CollateralInfos,
	amount: number,
	price: CollateralAmountPrice,
	proportions:
		| {
				proportions: {
					tokenA: bigint;
					tokenB: bigint;
				};
				collateralPrice: bigint;
		  }
		| undefined,
	coinPrices: Record<keyof Coins, number>,
	_leverage: number,
	maxLeverage: number,
	tokens: ReserveInfo[],
	borrowBalance: {
		borrowBalanceA: number;
		borrowBalanceB: number;
	},
	callback: () => void,
): () => Effect<CollateralPipelineState> {
	return async function* leveragePipeline() {
		yield leveragePipelineState;

		// Check if we need to approve the token
		const account = getAccount(config);
		if (!account.address || amount < 0 || Math.abs(amount - _leverage) < 0.01) {
			yield leveragePipelineState;
			return; // Restart the pipeline
		}

		const isLeverage = amount > (_leverage ?? 0);

		yield {
			buttonEnabled: true,
			buttonLabel: isLeverage ? "Apply Leverage" : "Apply Deleverage",
			buttonLoading: false,
		};

		yield {
			buttonEnabled: false,
			buttonLabel: isLeverage ? "Applying Leverage" : "Deleveraging",
			buttonLoading: true,
		};

		const tokensUSDPrices = getPairPrice(coinPrices, tokens, collateralInfo);

		const loanAUSD =
			borrowBalance.borrowBalanceA * (tokensUSDPrices.tokenA ?? 0);
		const loanBUSD =
			borrowBalance.borrowBalanceB * (tokensUSDPrices.tokenB ?? 0);

		const minLT = getBorrowerPoolBalanceLT(collateralInfo);
		const maxLT = getMaxLT(collateralInfo);

		const borrowerMaxLeverageLP =
			getBorrowerMaxLeverage(
				bigIntToDecimal(price.collateralValue, collateralInfo.decimals),
				bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals),
				loanAUSD,
				loanBUSD,
				minLT,
				maxLT,
			) ?? 0;

		// const maxLeverage = getBorrowerPoolMaxLeverage(collateralInfo);
		const collateralValue = price.collateralValue ?? 0n;
		const [,,loanValue] = await readContract(config, {
			...collateralPoolContract,
			functionName: "getLoanValue",
			args: [account.address, collateralInfo.addressLP],
		});
		const _targetLeverage = BigInt(Math.round(amount * 1e9)) * 10n ** 9n;
		const delta_colateral_value = _targetLeverage * (collateralValue - loanValue) / (10n ** 18n) - collateralValue;

		const lpPrice = proportions?.collateralPrice ?? 0n;

		const transactionAmount = (delta_colateral_value * (10n ** 18n)) / lpPrice;

		const abs = (n: bigint) => (n === -0n || n < 0n ? -n : n);

		const [amount0, amount1] = await readContract(config, {
			...collateralPoolContract,
			functionName: "getAmounts",
			args: [collateralInfo.addressLP, abs(transactionAmount)],
		});

		console.log(`Transaction value: ${delta_colateral_value}`);
		console.log(`Transaction amount: ${transactionAmount}, tokenA: ${amount0}, tokenB: ${amount1}`);

		const leverage = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						const gasPrice = await getGasPrice(config);
						const gas = 579234n * 2n;
						// Deposit the token
						const hash = await writeContract(config, {
							abi: abiCollateralPool,
							address: process.env
								.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
							functionName: "leverage",
							args: [collateralInfo.addressLP, abs(transactionAmount)],
							gas,
							gasPrice,
							type: "legacy",
						});

						const receipt = await waitForTransactionReceipt(config, {
							hash,
						});

						if (receipt.status === "success") {
							return receipt;
						}
						throw new Error("Transaction reverted");
					},
					{
						loading: "Applying Leverage...",
						success: (data) => {
							resolve();
							return "Leverage Applied";
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

		const deleverage = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						const gasPrice = await getGasPrice(config);
						const gas = 579234n * 2n;
						// Deposit the token
						const hash = await writeContract(config, {
							abi: abiCollateralPool,
							address: process.env
								.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
							functionName: "deleverage",
							args: [collateralInfo.addressLP, abs(transactionAmount)],
							gas,
							gasPrice,
							type: "legacy",
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
						loading: "Deleveraging...",
						success: (data) => {
							resolve();
							return "Deleveraged";
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

		const borrowerLt = useFarmAddressStore.getState().borrowerLt;

		const adjustedPriceA = BigInt(
			Math.round((tokensUSDPrices.tokenA ?? 0) * 1e6 ?? 0),
		);
		const adjustedPriceB = BigInt(
			Math.round((tokensUSDPrices.tokenB ?? 0) * 1e6 ?? 0),
		);

		const newCollateralFactor =
			(10n ** 8n *
				(proportions?.collateralPrice ?? 0n) *
				((price?.collateralAmount ?? 0n) + transactionAmount)) /
			(amount0 * adjustedPriceA + amount1 * adjustedPriceB);

		const positionData =
			amount > 1
				? await readContract(config, {
						account: account.address,
						abi: abiBorrowerData,
						address: process.env
							.NEXT_PUBLIC_BORROWERDATA_CONTRACT_ADDRESS as `0x${string}`,
						functionName: "getPositionData",
						args: [
							{
								token: collateralInfo.addressLP,
								borrower: account.address,
								amount: abs(transactionAmount),
								amount0,
								amount1,
								direction: isLeverage,
								direction0: isLeverage,
								direction1: isLeverage,
							},
						],
					})
				: {
						debt0: 1n,
						debt1: 1n,
						liquidationFactor: borrowerLt,
						leverageFactor:
							BigInt(Math.round(amount * 1000)) * 10n ** 15n,
						collateralFactor:
							((proportions?.collateralPrice ?? 0n) *
								((price.collateralAmount ?? 0n) + transactionAmount)) /
							(adjustedPriceA + adjustedPriceB),
					};

		const collatPrice =
			bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ??
			0;

		const showImpact = new Promise<void>((resolve) => {
			useImpactStore.setState({
				open: true,
				title: "Confirm Leverage",
				transactionDetails: {
					title: isLeverage ? "Leverage" : "Deleverage",
					amount: abs(transactionAmount),
					symbol: (
						<PairIcon
							userCollateralsInfo={collateralInfo}
							reservesInfo={tokens}
							size="tiny"
							symbol={false}
							className="translate-y-1"
						/>
					),
					decimals: collateralInfo.decimals,
					price: collatPrice,
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
						fromAmount: price.collateralAmount ?? 0n,
						toAmount: (price.collateralAmount ?? 0n) + abs(transactionAmount),
						fromDecimals: collateralInfo.decimals,
						toDecimals: collateralInfo.decimals,
						fromPrice: collatPrice,
						toPrice: collatPrice,
					},
					{
						label: tokens[0].symbol,
						type: "loan",
						symbol: (
							<Image
								className="inline"
								src={tokens[0].imgSrc}
								alt={tokens[0].symbol}
								width={18}
								height={18}
							/>
						),
						fromAmount: parseUnits(
							borrowBalance.borrowBalanceA.toString(),
							tokens[0].decimals,
						),
						toAmount: positionData.debt0,
						fromDecimals: tokens[0].decimals,
						toDecimals: tokens[0].decimals,
						fromPrice: tokensUSDPrices.tokenA ?? 0,
						toPrice: tokensUSDPrices.tokenA ?? 0,
					},
					{
						label: tokens[1].symbol,
						type: "loan",
						symbol: (
							<Image
								className="inline"
								src={tokens[1].imgSrc}
								alt={tokens[1].symbol}
								width={18}
								height={18}
							/>
						),
						fromAmount: parseUnits(
							borrowBalance.borrowBalanceB.toString(),
							tokens[1].decimals,
						),
						toAmount: positionData.debt1,
						fromDecimals: tokens[1].decimals,
						toDecimals: tokens[1].decimals,
						fromPrice: tokensUSDPrices.tokenB ?? 0,
						toPrice: tokensUSDPrices.tokenB ?? 0,
					},
				],
				note: (
					<>
						<div className="flex justify-between">
							<div className="w-36">Collateral Factor</div>
							<div className="w-12">
								{formatPCTFactor(
									bigIntToDecimal(
										price.collateralFactor,
										collateralInfo.decimals - 2,
									) ?? 0,
								)}
							</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{formatPCTFactor(
									bigIntToDecimal(positionData?.collateralFactor, collateralInfo.decimals - 2),
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
								{formatPCTFactor(
									bigIntToDecimal(
										positionData?.liquidationFactor,
										collateralInfo.decimals - 2,
									),
								)}
							</div>
						</div>
						<div className="flex justify-between">
							<div className="w-36">Leverage</div>
							<div className="w-12">{securdFormat(_leverage, 2)}x</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{securdFormat(
									// amount,
									bigIntToDecimal(
										positionData?.leverageFactor,
										collateralInfo.decimals,
									) ?? 0,
									2,
								)}
								x
							</div>
						</div>
					</>
				),
				action: async () => {
					try {
						if (isLeverage) {
							await leverage();
						} else {
							await deleverage();
						}
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
