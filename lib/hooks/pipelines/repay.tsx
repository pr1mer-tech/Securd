import { Coins, ReserveInfo } from "@/lib/types/save.types";
import { BaseError, erc20Abi, parseUnits } from "viem";
import { Config } from "wagmi";
import { readContract, getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { CollateralPipelineState, repayPipelineState } from "./CollateralPipelineState";
import { CollateralInfos } from "@/lib/types/farm.types";
import { CollateralAmountPrice } from "../wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal, isEqualAddress } from "@/lib/helpers/main.helpers";
import { getPairPrice, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import Image from "next/image";
import PairIcon from "@/components/farm/PairIcon";
import { ArrowRight } from "lucide-react";
import { formatPCTFactor, securdFormat } from "@/lib/helpers/numberFormat.helpers";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";

export function repay(
    config: Config,
    collateralInfo: CollateralInfos,
    selectedAsset: ReserveInfo,
    amount: bigint,
    price: CollateralAmountPrice,
    proportions: {
        proportions: {
            tokenA: bigint;
            tokenB: bigint;
        };
        collateralPrice: bigint;
    } | undefined,
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
        const userBalance = isEqualAddress(tokens[0].address, selectedAsset.address) ? borrowBalance.borrowBalanceA : borrowBalance.borrowBalanceB;
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
                    return "Repaid";
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

        const borrowerLt = useFarmAddressStore.getState().borrowerLt;
        const leverage = useFarmAddressStore.getState().leverage();

        const tokensUn = getTokensSymbol(collateralInfo);

        const tokensUSDPrices = getPairPrice(coinPrices, tokens, collateralInfo);

        const debt0 = parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals) - (isEqualAddress(selectedAsset.address, tokens[0].address) ? amount : 0n);
        const debt1 = parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[1].decimals) - (isEqualAddress(selectedAsset.address, tokens[1].address) ? amount : 0n);

        const adjustedPriceA = debt0 * BigInt(Math.round((tokensUSDPrices.tokenA ?? 0) * 1e6 ?? 0));
        const adjustedPriceB = debt1 * BigInt(Math.round((tokensUSDPrices.tokenB ?? 0) * 1e6 ?? 0));

        const newCollateralFactor = (proportions?.collateralPrice ?? 0n) * (price.collateralAmount ?? 0n) / (adjustedPriceA + adjustedPriceB);

        const collatPrice = bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ?? 0;
        const newBorrowerLT = debt0 * 10n ** 6n / debt1;

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Repay",
                transactionDetails: {
                    title: "Repay",
                    amount,
                    symbol: <Image className="inline" src={selectedAsset.imgSrc} alt={selectedAsset.symbol} width={18} height={18} />,
                    decimals: collateralInfo.decimals,
                    price: coinPrices[selectedAsset.symbol as keyof Coins],
                },
                impacts: [{
                    label: "Balance",
                    symbol: <PairIcon userCollateralsInfo={collateralInfo} reservesInfo={tokens} size="tiny" symbol={false} className="translate-y-1" />,
                    fromAmount: userDepositBalance,
                    toAmount: userDepositBalance,
                    fromDecimals: collateralInfo.decimals,
                    toDecimals: collateralInfo.decimals,
                    fromPrice: collatPrice,
                    toPrice: collatPrice,
                }, {
                    label: tokens[0].symbol,
                    symbol: <Image className="inline" src={tokens[0].imgSrc} alt={tokens[0].symbol} width={18} height={18} />,
                    fromAmount: parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals),
                    toAmount: debt0,
                    fromDecimals: tokens[0].decimals,
                    toDecimals: tokens[0].decimals,
                    fromPrice: coinPrices[tokens[0].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[0].symbol as keyof Coins],
                }, {
                    label: tokens[1].symbol,
                    symbol: <Image className="inline" src={tokens[1].imgSrc} alt={tokens[1].symbol} width={18} height={18} />,
                    fromAmount: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[0].decimals),
                    toAmount: debt1,
                    fromDecimals: tokens[1].decimals,
                    toDecimals: tokens[1].decimals,
                    fromPrice: coinPrices[tokens[1].symbol as keyof Coins],
                    toPrice: coinPrices[tokens[1].symbol as keyof Coins],
                }],
                note: <>
                    <div className="flex justify-between">
                        <div className="w-36">Collateral Factor</div>
                        <div className="w-12">{formatPCTFactor(bigIntToDecimal(price.collateralFactor, collateralInfo.decimals - 2) ?? 0)}</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{formatPCTFactor(bigIntToDecimal(newCollateralFactor, collateralInfo.decimals - 8))}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-36">Liquidation Threshold</div>
                        <div className="w-12">{formatPCTFactor(bigIntToDecimal(borrowerLt, collateralInfo.decimals - 2) ?? 0)}</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{formatPCTFactor(bigIntToDecimal(newBorrowerLT, 4))}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-36">Leverage</div>
                        <div className="w-12">{securdFormat(leverage, 2)}x</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{securdFormat(leverage, 2)}x</div>
                    </div>
                </>,
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