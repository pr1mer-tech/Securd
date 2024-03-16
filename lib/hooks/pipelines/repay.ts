import { Coins, ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi, parseUnits } from "viem";
import { Config } from "wagmi";
import { readContract, getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { SavePipelineState, savePipelineState } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { CollateralPipelineState, repayPipelineState } from "./CollateralPipelineState";
import { CollateralInfos } from "@/lib/types/farm.types";

export function repay(
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
    return async function* repayPipeline() {
        yield {
            buttonEnabled: amount > 0n,
            buttonLabel: "Approve",
            buttonLoading: false,
        }

        // Check if we need to approve the token
        const account = getAccount(config);
        const userBalance = tokens[0].address === selectedAsset.address ? borrowBalance.borrowBalanceA : borrowBalance.borrowBalanceB;
        if (!account.address || amount <= 0n || parseUnits(userBalance.toString(), selectedAsset.decimals) < amount) {
            yield repayPipelineState;
            return // Restart the pipeline
        }
        const result = await readContract(config, {
            abi: erc20Abi,
            address: selectedAsset.address,
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
                        address: selectedAsset.address,
                        functionName: "approve",
                        args: [process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`, amount],
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
            buttonLabel: "Repay",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: "Repaying",
            buttonLoading: true,
        }

        const deposit = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "repay",
                    args: [
                        collateralInfo.addressLP,
                        selectedAsset.address,
                        amount,
                        account.address!,
                    ],
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
                loading: "Repaying...",
                success: (data) => {
                    resolve();
                    return "Repayed";
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
                title: "Confirm Repay",
                transactionDetails: {
                    title: "Repay",
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
                    toAmount: parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals) - (selectedAsset.symbol === tokens[0].symbol ? amount : 0n),
                    fromDecimals: tokens[0].decimals,
                    toDecimals: tokens[0].decimals,
                    fromPrice: coinPrices[tokens[0].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[0].symbol as keyof Coins],
                }, {
                    label: tokens[1].symbol,
                    symbol: tokens[1].symbol,
                    fromAmount: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[0].decimals),
                    toAmount: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[1].decimals) - (selectedAsset.symbol === tokens[1].symbol ? amount : 0n),
                    fromDecimals: tokens[1].decimals,
                    toDecimals: tokens[1].decimals,
                    fromPrice: coinPrices[tokens[1].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[1].symbol as keyof Coins],
                }],
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