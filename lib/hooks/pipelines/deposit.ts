import { ReserveInfo } from "@/lib/types/save.types";
import { erc20Abi } from "viem";
import { Config } from "wagmi";
import { readContract, getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { SavePipelineState, savePipelineState } from "./SavePipelineState";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";

export function deposit(config: Config, reserveInfo: ReserveInfo, amount: bigint, callback: () => void): () => Effect<SavePipelineState> {
    return async function* depositPipeline() {
        yield {
            buttonEnabled: amount > 0n,
            buttonLabel: "Approve",
            buttonLoading: false,
        }

        // Check if we need to approve the token
        const account = getAccount(config);
        if (!account.address || amount <= 0n) {
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

                    const receipt = await waitForTransactionReceipt(config, {
                        hash,
                    });

                    if (receipt.status === "success") {
                        resolve();
                    } else {
                        reject();
                    }
                }, {
                    loading: "Approving...",
                    success: (data) => {
                        resolve(data);
                        return "Approved";
                    },
                    error: (error) => {
                        reject(error);
                        return "Error";
                    }
                })
            });
            await approve;
        }

        yield {
            buttonEnabled: true,
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
                    resolve();
                } else {
                    reject();
                }
            }, {
                loading: "Depositing...",
                success: (data) => {
                    resolve(data);
                    return "Deposited";
                },
                error: (error) => {
                    reject(error);
                    return "Error";
                }
            })
        }));

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Deposit",
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