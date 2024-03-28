import { Config } from "wagmi";
import { getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { Address, BaseError, TransactionRejectedRpcError, parseUnits } from "viem";
import { CollateralPipelineState, borrowPipelineState, withdrawPipelineState } from "./CollateralPipelineState";
import { CollateralInfos } from "@/lib/types/farm.types";
import { Coins, ReserveInfo } from "@/lib/types/save.types";

export function borrow(
    config: Config,
    collateralInfo: CollateralInfos,
    selectedAsset: ReserveInfo,
    amount: bigint,
    price: number,
    coinPrices: Record<keyof Coins, number>,
    userDepositBalance: bigint,
    tokens: ReserveInfo[],
    borrowBalance: {
        borrowBalanceA: number;
        borrowBalanceB: number;
    },
    callback: () => void
): () => Effect<CollateralPipelineState> {
    return async function* borrowPipeline() {
        yield borrowPipelineState;

        // Check if we need to approve the token
        const account = getAccount(config);
        if (!account.address || amount <= 0n || userDepositBalance < amount) {
            yield borrowPipelineState;
            return // Restart the pipeline
        }

        yield {
            buttonEnabled: true,
            buttonLabel: "Borrow",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: "Borrowing",
            buttonLoading: true,
        }

        const borrow = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "borrow",
                    args: [collateralInfo.addressLP, selectedAsset.address, amount, account.address!],
                });

                if (!hash) {
                    throw new Error("Transaction rejected");
                }

                const receipt = await waitForTransactionReceipt(config, {
                    hash,
                });

                if (receipt.status === "success") {
                    return receipt;
                } else {
                    throw new Error("Transaction reverted");
                }
            }, {
                loading: "Borrowing...",
                success: (data) => {
                    resolve();
                    return "Borrowed";
                },
                error: (error) => {
                    reject(error);
                    if (error instanceof BaseError) {
                        return error.shortMessage;
                    }
                    if (error instanceof Error) {
                        return `Error: ${error.message}`
                    }
                    return "Error"
                }
            })
        }));

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Borrow",
                transactionDetails: {
                    title: "Borrow",
                    amount,
                    symbol: selectedAsset.symbol,
                    decimals: collateralInfo.decimals,
                    price: coinPrices[selectedAsset.symbol as keyof Coins],
                },
                impacts: [{
                    label: "Balance",
                    symbol: collateralInfo.symbol,
                    fromAmount: userDepositBalance,
                    toAmount: userDepositBalance,
                    fromDecimals: collateralInfo.decimals,
                    toDecimals: collateralInfo.decimals,
                    fromPrice: price,
                    toPrice: price,
                }, {
                    label: tokens[0].symbol,
                    symbol: tokens[0].symbol,
                    fromAmount: parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals),
                    toAmount: parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals) + (selectedAsset.symbol === tokens[0].symbol ? amount : 0n),
                    fromDecimals: tokens[0].decimals,
                    toDecimals: tokens[0].decimals,
                    fromPrice: coinPrices[tokens[0].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[0].symbol as keyof Coins],
                }, {
                    label: tokens[1].symbol,
                    symbol: tokens[1].symbol,
                    fromAmount: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[0].decimals),
                    toAmount: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[1].decimals) + (selectedAsset.symbol === tokens[1].symbol ? amount : 0n),
                    fromDecimals: tokens[1].decimals,
                    toDecimals: tokens[1].decimals,
                    fromPrice: coinPrices[tokens[1].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[1].symbol as keyof Coins],
                }],
                action: async () => {
                    try {
                        await borrow();
                        callback();
                    } catch (error) {
                        console.error(error);
                    }
                },
                finalize: () => {
                    resolve();
                }
            });
        });
        await showImpact;
    }
}