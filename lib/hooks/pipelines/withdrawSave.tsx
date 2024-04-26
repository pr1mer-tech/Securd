import type { ReserveInfo } from "@/lib/types/save.types";
import type { Config } from "wagmi";
import { getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import { type SavePipelineState, savePipelineState2 } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { BaseError, TransactionRejectedRpcError } from "viem";
import Image from "next/image";

export function withdraw(config: Config, reserveInfo: ReserveInfo, amount: bigint, price: number, userDepositBalance: bigint, callback: () => void): () => Effect<SavePipelineState> {
    return async function* withdrawPipeline() {
        yield savePipelineState2;

        // Check if we need to approve the token
        const account = getAccount(config);
        if (!account.address || amount <= 0n || userDepositBalance < amount) {
            yield savePipelineState2;
            return // Restart the pipeline
        }

        yield {
            buttonEnabled: true,
            buttonLabel: "Withdraw",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: "Withdrawing",
            buttonLoading: true,
        }

        const withdraw = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "withdraw",
                    args: [reserveInfo.address, amount, account.address!],
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
            }, {
                loading: "Withdrawing...",
                success: (data) => {
                    resolve();
                    return "Withdrawn";
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
                title: "Confirm Withdrawal",
                transactionDetails: {
                    title: "Withdraw",
                    amount,
                    symbol: <Image className="inline" src={reserveInfo.imgSrc} alt={reserveInfo.symbol} width={18} height={18} />,
                    decimals: reserveInfo.decimals,
                    price: price,
                },
                impacts: [{
                    label: "Balance",
                    fromAmount: userDepositBalance,
                    toAmount: userDepositBalance - amount,
                    fromDecimals: reserveInfo.decimals,
                    toDecimals: reserveInfo.decimals,
                    fromPrice: price,
                    toPrice: price,
                }],
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
                }
            });
        });
        await showImpact;
    }
}