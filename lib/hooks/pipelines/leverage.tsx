import { Config } from "wagmi";
import { getAccount, writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { Effect } from "./useValueEffect";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { Address, BaseError, TransactionRejectedRpcError, parseUnits } from "viem";
import { CollateralPipelineState, borrowPipelineState, leveragePipelineState, withdrawPipelineState } from "./CollateralPipelineState";
import { CollateralInfos } from "@/lib/types/farm.types";
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import { getBorrowerMaxLeverage, getBorrowerPoolBalanceLT, getBorrowerPoolMaxLeverage, getMaxLT, getPairPrice, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import { CollateralAmountPrice } from "../wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { leverageToLp } from "@/lib/helpers/borrower.helpers";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import PairIcon from "@/components/farm/PairIcon";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatPCTFactor, securdFormat } from "@/lib/helpers/numberFormat.helpers";

export function leverage(
    config: Config,
    collateralInfo: CollateralInfos,
    amount: number,
    price: CollateralAmountPrice,
    proportions: {
        proportions: {
            tokenA: bigint;
            tokenB: bigint;
        };
        collateralPrice: bigint;
    } | undefined,
    coinPrices: Record<keyof Coins, number>,
    _leverage: number,
    tokens: ReserveInfo[],
    borrowBalance: {
        borrowBalanceA: number;
        borrowBalanceB: number;
    },
    callback: () => void
): () => Effect<CollateralPipelineState> {
    return async function* leveragePipeline() {
        yield leveragePipelineState;

        // Check if we need to approve the token
        const account = getAccount(config);
        if (!account.address || amount <= 0) {
            yield leveragePipelineState;
            return // Restart the pipeline
        }

        const isLeverage = amount > (_leverage ?? 0)

        yield {
            buttonEnabled: true,
            buttonLabel: isLeverage ? "Apply Leverage" : "Apply Deleverage",
            buttonLoading: false,
        }

        yield {
            buttonEnabled: false,
            buttonLabel: isLeverage ? "Applying Leverage" : "Deleveraging",
            buttonLoading: true,
        }

        const tokensUn = getTokensSymbol(collateralInfo);

        const tokensUSDPrices = getPairPrice(coinPrices, tokens, tokensUn);

        const loanAUSD = borrowBalance.borrowBalanceA * (tokensUSDPrices.tokenA ?? 0);
        const loanBUSD = borrowBalance.borrowBalanceB * (tokensUSDPrices.tokenB ?? 0)

        const minLT = getBorrowerPoolBalanceLT(collateralInfo);
        const maxLT = getMaxLT(collateralInfo);

        const borrowerMaxLeverageLP = getBorrowerMaxLeverage(
            bigIntToDecimal(price.collateralValue, collateralInfo.decimals),
            bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals),
            loanAUSD,
            loanBUSD,
            minLT,
            maxLT
        )

        const maxLeverage = getBorrowerPoolMaxLeverage(collateralInfo);

        const _transactionAmount = leverageToLp(
            amount,
            _leverage,
            maxLeverage,
            borrowerMaxLeverageLP,
        )

        const abs = (n: bigint) => (n === -0n || n < 0n) ? -n : n;

        const transactionAmount = parseUnits(_transactionAmount?.toString() ?? "0", collateralInfo.decimals);

        console.log("transactionAmount", _transactionAmount);

        const leverage = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "leverage",
                    args: [collateralInfo.addressLP, abs(transactionAmount)],
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
                loading: "Applying Leverage...",
                success: (data) => {
                    resolve();
                    return "Leverage Applied";
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

        const deleverage = () => (new Promise<void>((resolve, reject) => {
            toast.promise(async () => {
                // Deposit the token
                const hash = await writeContract(config, {
                    abi: abiCollateralPool,
                    address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
                    functionName: "deleverage",
                    args: [collateralInfo.addressLP, abs(transactionAmount)],
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
                loading: "Deleveraging...",
                success: (data) => {
                    resolve();
                    return "Deleveraged";
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

        const positionData = await readContract(config, {
            abi: abiCollateralPool,
            address: process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
            functionName: "getPositionData",
            args: [
                {
                    token: collateralInfo.addressLP,
                    borrower: account.address!,
                    amount: price.collateralAmount ?? 0n,
                    amount0: parseUnits(borrowBalance.borrowBalanceA.toString(), tokens[0].decimals),
                    amount1: parseUnits(borrowBalance.borrowBalanceB.toString(), tokens[1].decimals),
                    direction: isLeverage,
                    direction0: isLeverage,
                    direction1: isLeverage,
                },
            ]
        });

        const showImpact = new Promise<void>((resolve) => {
            useImpactStore.setState({
                open: true,
                title: "Confirm Leverage",
                transactionDetails: {
                    title: isLeverage ? "Leverage" : "Deleverage",
                    amount: transactionAmount,
                    symbol: collateralInfo.symbol,
                    decimals: collateralInfo.decimals,
                    price: bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ?? 0,
                },
                impacts: [{
                    label: "Balance",
                    symbol: <PairIcon userCollateralsInfo={collateralInfo} reservesInfo={tokens} size="tiny" symbol={false} className="translate-y-1" />,
                    fromAmount: price.collateralAmount ?? 0n,
                    toAmount: (price.collateralAmount ?? 0n) + transactionAmount,
                    fromDecimals: collateralInfo.decimals,
                    toDecimals: collateralInfo.decimals,
                    fromPrice: bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ?? 0,
                    toPrice: bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ?? 0,
                }, {
                    label: tokens[0].symbol,
                    symbol: <Image className="inline" src={tokens[0].imgSrc} alt={tokens[0].symbol} width={18} height={18} />,
                    fromAmount: proportions?.proportions.tokenA ?? 0n,
                    toAmount: proportions?.proportions.tokenA ?? 0n,
                    fromDecimals: tokens[0].decimals,
                    toDecimals: tokens[0].decimals,
                    fromPrice: tokensUSDPrices.tokenA ?? 0,
                    toPrice: tokensUSDPrices.tokenA ?? 0,
                }, {
                    label: tokens[1].symbol,
                    symbol: <Image className="inline" src={tokens[1].imgSrc} alt={tokens[1].symbol} width={18} height={18} />,
                    fromAmount: proportions?.proportions.tokenB ?? 0n,
                    toAmount: proportions?.proportions.tokenB ?? 0n,
                    fromDecimals: tokens[1].decimals,
                    toDecimals: tokens[1].decimals,
                    fromPrice: tokensUSDPrices.tokenB ?? 0,
                    toPrice: tokensUSDPrices.tokenB ?? 0,
                }],
                note: <>
                    <div className="flex justify-between">
                        <div className="w-36">Collateral Factor</div>
                        <div className="w-12">{formatPCTFactor(bigIntToDecimal(price.collateralFactor, collateralInfo.decimals - 2) ?? 0)}</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{formatPCTFactor(bigIntToDecimal(positionData?.collateralFactor, collateralInfo.decimals - 2))}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-36">Liquidation Threshold</div>
                        <div className="w-12">{formatPCTFactor(bigIntToDecimal(borrowerLt, collateralInfo.decimals - 2) ?? 0)}</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{formatPCTFactor(bigIntToDecimal(positionData?.liquidationFactor, collateralInfo.decimals - 2))}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="w-36">Leverage</div>
                        <div className="w-12">{securdFormat(_leverage, 2)}x</div>
                        <ArrowRight className="w-6 h-6" />
                        <div className="w-12 text-right">{securdFormat(amount, 2)}x</div>
                    </div>
                </>,
                action: async () => {
                    try {
                        if (isLeverage) {
                            await leverage();
                        } else {
                            await deleverage();
                        }
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