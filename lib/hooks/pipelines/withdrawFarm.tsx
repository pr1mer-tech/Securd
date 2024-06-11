import { ReserveInfo } from "@/lib/types/save.types";
import type { Config } from "wagmi";
import {
	getAccount,
	writeContract,
	waitForTransactionReceipt,
	getGasPrice,
	readContract,
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
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";

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

		const simulate = {
			abi: abiCollateralPool,
			address: process.env
				.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
			functionName: "withdraw",
			args: [collateralInfo.addressLP, amount, account.address ?? "0x"],
		} as const;
		const withdraw = () =>
			new Promise<void>((resolve, reject) => {
				toast.promise(
					async () => {
						const gasPrice = await getGasPrice(config);
						const gas = 365175n * 2n;
						// Deposit the token
						const hash = await writeContract(config, {
							...simulate,
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
		const leverage = useFarmAddressStore.getState().leverage();
		const borrowerBalances = useFarmAddressStore.getState().borrowBalances();

		const positionData =
			(borrowerBalances?.borrowBalanceA ?? 0) > 0 ||
			(borrowerBalances?.borrowBalanceB ?? 0) > 0
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
								amount: amount,
								amount0: 0n,
								amount1: 0n,
								direction: false,
								direction0: false,
								direction1: false,
							},
						],
					})
				: null;

		const showImpact = new Promise<void>((resolve) => {
			useImpactStore.setState({
				open: true,
				title: "Confirm Release",
				simulate,
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
										positionData?.collateralFactor,
										collateralInfo.decimals - 2,
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
									) ?? leverage,
									2,
								)}
								x
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
