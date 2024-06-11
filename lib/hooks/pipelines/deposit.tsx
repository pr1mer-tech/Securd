import type { ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi, zeroAddress } from "viem";
import type { Config } from "wagmi";
import {
	readContract,
	getAccount,
	writeContract,
	waitForTransactionReceipt,
	getGasPrice,
	estimateGas,
} from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import { type SavePipelineState, savePipelineState } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import Image from "next/image";
import { abiLendingPool } from "@/lib/constants/abi/abiLendingPool";

export function deposit(
	config: Config,
	reserveInfo: ReserveInfo,
	amount: bigint,
	price: number,
	userDepositBalance: bigint,
	userBalance: bigint,
	callback: () => void,
): () => Effect<SavePipelineState> {
	return async function* depositPipeline() {
		yield {
			buttonEnabled: amount > 0n,
			buttonLabel: reserveInfo.address === zeroAddress ? "Deposit" : "Approve",
			buttonLoading: false,
		};
		// Check if we need to approve the token
		const account = getAccount(config);
		if (reserveInfo.address !== zeroAddress) {
			if (!account.address || amount <= 0n || userBalance < amount) {
				yield savePipelineState;
				return; // Restart the pipeline
			}
			const result = await readContract(config, {
				abi: erc20Abi,
				address: reserveInfo.address,
				functionName: "allowance",
				args: [
					account.address,
					process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`,
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
								address: reserveInfo.address,
								functionName: "approve",
								args: [
									process.env
										.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`,
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
		}

		yield {
			buttonEnabled: amount > 0n,
			buttonLabel: "Deposit",
			buttonLoading: false,
		};

		yield {
			buttonEnabled: false,
			buttonLabel: "Depositing",
			buttonLoading: true,
		};

		const simulate = {
			abi: abiLendingPool,
			address: process.env
				.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`,
			functionName: "supply", // TODO: Check if this is the right function
			args: [reserveInfo.address, amount, account.address as `0x${string}`],
		} as const;

		const deposit = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						const gasPrice = await getGasPrice(config);
						const gas = 153072n * 2n;
						// Deposit the token
						const hash = await writeContract(config, {
							...simulate,
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
						loading: "Depositing...",
						success: (data) => {
							resolve();
							return "Deposited";
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

		const showImpact = new Promise<void>((resolve) => {
			useImpactStore.setState({
				open: true,
				title: "Confirm Deposit",
				simulate,
				transactionDetails: {
					title: "Deposit",
					amount,
					symbol: (
						<Image
							className="inline"
							src={reserveInfo.imgSrc}
							alt={reserveInfo.symbol}
							width={18}
							height={18}
						/>
					),
					decimals: reserveInfo.decimals,
					price,
				},
				impacts: [
					{
						label: "Account Balance",
						fromAmount: userDepositBalance,
						toAmount: userDepositBalance + amount,
						fromDecimals: reserveInfo.decimals,
						toDecimals: reserveInfo.decimals,
						fromPrice: price,
						toPrice: price,
					},
				],
				note: null,
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
