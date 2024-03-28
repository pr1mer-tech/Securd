import { ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi } from "viem";
import { Config } from "wagmi";
import { readContract, getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { CollateralPipelineState, lockPipelineState } from "./CollateralPipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { CollateralInfos } from "@/lib/types/farm.types";

export function lock(config: Config, collateralInfo: CollateralInfos, amount: bigint, price: number, userDepositBalance: bigint, userBalance: bigint, callback: () => void): () => Effect<CollateralPipelineState> {
    return async function* lockPipeline() {
        yield {
            buttonEnabled: amount > 0n,
            buttonLabel: "Approve",
            buttonLoading: false,
        }

        // Check if we need to approve the token
        const account = getAccount(config);
        if (!account.address || amount <= 0n || userBalance < amount) {
            yield lockPipelineState;
            return // Restart the pipeline
        }
        const result = await readContract(config, {
            abi: erc20Abi,
            address: collateralInfo.addressLP,
            functionName: "allowance",
            args: [account.address, process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`],
        })

        if (result < amount) {
            yield {
                buttonEnabled: true,
                buttonLabel: "Approve",
                buttonLoading: false,
            }

            yield {
                buttonEnabled: false,
                buttonLabel: "Approving",
                buttonLoading: true,
            }
            const approve = new Promise<void>((resolve, reject) => {
                toast.promise(async () => {
                    // Approve the token
                    const hash = await writeContract(config, {
                        abi: erc20Abi,
                        address: collateralInfo.addressLP,
                        functionName: "approve",
                        args: [process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`, amount],
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
                            return `Error: ${error.message}`
                        }
                        return "Error"
                    }
                })
            });
            await approve;
        }

        yield {
            buttonEnabled: true,
            buttonLabel: "Lock",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: "Locking",
            buttonLoading: true,
        }

        const deposit = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "supply",
                    args: [collateralInfo.addressLP, amount, account.address!],
                });

                const receipt = await waitForTransactionReceipt(config, {
                    hash,
                });

                if (receipt.status === "success") {
                    return receipt;
                } else {
                    throw new Error("Transaction reverted");
                }
            }, {
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
                        return `Error: ${error.message}`
                    }
                    return "Error"
                }
            })
        }));

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Lock",
                transactionDetails: {
                    title: "Lock",
                    amount,
                    symbol: collateralInfo.symbol,
                    decimals: collateralInfo.decimals,
                    price,
                },
                impacts: [
                    {
                        label: "Account Balance",
                        fromAmount: userDepositBalance,
                        toAmount: userDepositBalance + amount,
                        fromDecimals: collateralInfo.decimals,
                        toDecimals: collateralInfo.decimals,
                        fromPrice: price,
                        toPrice: price,
                    }
                ],
                action: async () => {
                    await deposit();
                    callback();
                },
                finalize: () => {
                    resolve();
                }
            });
        });

        await showImpact;
    }
}