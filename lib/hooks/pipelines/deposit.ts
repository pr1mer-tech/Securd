import { ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi, zeroAddress } from "viem";
import { Config } from "wagmi";
import { readContract, getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { SavePipelineState, savePipelineState } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";

export function deposit(config: Config, reserveInfo: ReserveInfo, amount: bigint, price: number, userDepositBalance: bigint, userBalance: bigint, callback: () => void): () => Effect<SavePipelineState> {
    return async function* depositPipeline() {
        yield {
            buttonEnabled: amount > 0n,
            buttonLabel: reserveInfo.address == zeroAddress ? "Deposit" : "Approve",
            buttonLoading: false,
        }
        // Check if we need to approve the token
        const account = getAccount(config);
        if (reserveInfo.address != zeroAddress) {
            if (!account.address || amount <= 0n || userBalance < amount) {
                yield savePipelineState;
                return // Restart the pipeline
            }
            const result = await readContract(config, {
                abi: erc20Abi,
                address: reserveInfo.address,
                functionName: "allowance",
                args: [account.address, process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`],
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
                            address: reserveInfo.address,
                            functionName: "approve",
                            args: [process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`, amount],
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
        }

        yield {
            buttonEnabled: amount > 0n,
            buttonLabel: "Deposit",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: "Depositing",
            buttonLoading: true,
        }

        const deposit = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "supply",
                    args: [reserveInfo.address, amount, account.address!],
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
                        return `Error: ${error.message}`
                    }
                    return "Error"
                }
            })
        }));

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Deposit",
                transactionDetails: {
                    title: "Deposit",
                    amount,
                    symbol: reserveInfo.symbol,
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