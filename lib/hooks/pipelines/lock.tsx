import { ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi, parseUnits } from "viem";
import type { Config } from "wagmi";
import {
	readContract,
	getAccount,
	writeContract,
	waitForTransactionReceipt,
	getGasPrice,
} from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import {
	type CollateralPipelineState,
	lockPipelineState,
} from "./CollateralPipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import type { CollateralInfos } from "@/lib/types/farm.types";
import PairIcon from "@/components/farm/PairIcon";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import {
	formatPCTFactor,
	securdFormat,
} from "@/lib/helpers/numberFormat.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { ArrowRight } from "lucide-react";
import { getPairPrice, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";

export function lock(
	config: Config,
	collateralInfo: CollateralInfos,
	amount: bigint,
	price: number,
	userDepositBalance: bigint,
	userBalance: bigint,
	callback: () => void,
): () => Effect<CollateralPipelineState> {
	return async function* lockPipeline() {
		yield {
			buttonEnabled: amount > 0n,
			buttonLabel: "Approve",
			buttonLoading: false,
		};

		// Check if we need to approve the token
		const account = getAccount(config);
		if (!account.address || amount <= 0n || userBalance < amount) {
			yield lockPipelineState;
			return; // Restart the pipeline
		}
		const result = await readContract(config, {
			abi: erc20Abi,
			address: collateralInfo.addressLP,
			functionName: "allowance",
			args: [
				account.address,
				process.env
					.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
			],
		});

		if (result < amount) {
			yield {
				buttonEnabled: true,
				buttonLabel: "Approve",
				buttonLoading: false,
			};

			yield {
				buttonEnabled: false,
				buttonLabel: "Approving",
				buttonLoading: true,
			};
			const approve = new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						// Approve the token
						const hash = await writeContract(config, {
							abi: erc20Abi,
							address: collateralInfo.addressLP,
							functionName: "approve",
							args: [
								process.env
									.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
								amount,
							],
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
						loading: "Approving...",
						success: (data) => {
							resolve();
							return "Approved";
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
			await approve;
		}

		yield {
			buttonEnabled: true,
			buttonLabel: "Lock",
			buttonLoading: false,
		};

		yield {
			buttonEnabled: false,
			buttonLabel: "Locking",
			buttonLoading: true,
		};

		const deposit = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						const gasPrice = await getGasPrice(config);
						const gas = 365175n * 2n;
						// Deposit the token
						const hash = await writeContract(config, {
							abi: abiCollateralPool,
							address: process.env
								.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
							functionName: "supply",
							args: [collateralInfo.addressLP, amount, account.address ?? "0x"],
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
						loading: "Locking...",
						success: (data) => {
							resolve();
							return "Locked";
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
		const leverage = useFarmAddressStore.getState().leverage();

		const positionData = await readContract(config, {
			account: account.address,
			abi: abiBorrowerData,
			address: process.env
				.NEXT_PUBLIC_BORROWERDATA_CONTRACT_ADDRESS as `0x${string}`,
			functionName: "getPositionData",
			args: [
				{
					token: collateralInfo.addressLP,
					borrower: account.address,
					amount: amount,
					amount0: 0n,
					amount1: 0n,
					direction: true,
					direction0: false,
					direction1: false,
				},
			],
		});

		const showImpact = new Promise<void>((resolve) => {
			useImpactStore.setState({
				open: true,
				title: "Confirm Lock",
				transactionDetails: {
					title: "Lock",
					amount,
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
					price,
				},
				impacts: [
					{
						label: "Account Balance",
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
						toAmount: userDepositBalance + amount,
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
										positionData?.collateralFactor,
										collateralInfo.decimals,
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
							<div className="w-12">{securdFormat(leverage, 2)}x</div>
							<ArrowRight className="w-6 h-6" />
							<div className="w-12 text-right">
								{securdFormat(
									bigIntToDecimal(
										positionData?.leverageFactor,
										collateralInfo.decimals,
									),
									2,
								)}
								x
							</div>
						</div>
					</>
				),
				action: async () => {
					await deposit();
					callback();
				},
				finalize: () => {
					resolve();
				},
			});
		});

		await showImpact;
	};
}
