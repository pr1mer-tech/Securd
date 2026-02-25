import type { Config } from "wagmi";
import {
  getAccount,
  writeContract,
  waitForTransactionReceipt,
  getGasPrice,
  readContract,
} from "wagmi/actions";
import type { Effect } from "./useValueEffect";
import { toast } from "sonner";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { useImpactStore } from "@/components/layout/Impact";
import { BaseError } from "viem";
import {
  type CollateralPipelineState,
  borrowPipelineState,
} from "./CollateralPipelineState";
import type { CollateralInfos } from "@/lib/types/farm.types";
import type { Coins, ReserveInfo } from "@/lib/types/save.types";
import type { CollateralAmountPrice } from "../wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal, isEqualAddress } from "@/lib/helpers/main.helpers";
import {
  formatPCTFactor,
  securdFormat,
} from "@/lib/helpers/numberFormat.helpers";
import { ArrowRight } from "lucide-react";
import PairIcon from "@/components/farm/PairIcon";
import Image from "next/image";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";

//@ts-expect-error BigInt is not defined in the browser
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export function borrow(
  config: Config,
  collateralInfo: CollateralInfos,
  selectedAsset: ReserveInfo,
  amount: bigint,
  price: CollateralAmountPrice,
  proportions:
    | {
        proportions: {
          tokenA: bigint;
          tokenB: bigint;
        };
        collateralPrice: bigint;
      }
    | undefined,
  coinPrices: Record<keyof Coins, number>,
  userDepositBalance: bigint,
  tokens: ReserveInfo[],
  borrowBalance: {
    borrowBalanceA: number;
    borrowBalanceB: number;
  },
  callback: () => void,
): () => Effect<CollateralPipelineState> {
  return async function* borrowPipeline() {
    yield borrowPipelineState;

    // Check if we need to approve the token
    const account = getAccount(config);
    if (!account.address || amount <= 0n) {
      yield borrowPipelineState;
      return; // Restart the pipeline
    }

    yield {
      buttonEnabled: true,
      buttonLabel: "Borrow",
      buttonLoading: false,
    };

    yield {
      buttonEnabled: false,
      buttonLabel: "Borrowing",
      buttonLoading: true,
    };

    const simulate = {
      abi: abiCollateralPool,
      address: process.env
        .NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "borrow",
      args: [
        collateralInfo.addressLP,
        selectedAsset.address,
        amount,
        account.address ?? "0x",
      ],
    } as const;

    const borrow = () =>
      new Promise<void>((resolve, reject) => {
        toast.promise(
          async () => {
            const gasPrice = await getGasPrice(config);
            const gas = 387734n * 2n;
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
            loading: "Borrowing...",
            success: () => {
              resolve();
              return "Borrowed";
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

    const borrowerLt = useFarmAddressStore.getState().borrowerLt;
    const leverage = useFarmAddressStore.getState().leverage();

    const [token0, token1] = tokens;
    if (token0 === undefined || token1 === undefined) {
      return;
    }

    const debt0 =
      BigInt(Math.round(borrowBalance.borrowBalanceA * 1e9)) *
        10n ** BigInt(token0.decimals - 9) +
      (isEqualAddress(selectedAsset.address, token0.address) ? amount : 0n);
    const debt1 =
      BigInt(Math.round(borrowBalance.borrowBalanceB * 1e9)) *
        10n ** BigInt(token1.decimals - 9) +
      (isEqualAddress(selectedAsset.address, token1.address) ? amount : 0n);

    const collatPrice =
      bigIntToDecimal(proportions?.collateralPrice, collateralInfo.decimals) ??
      0;

    const positionData = await readContract(config, {
      account: account.address,
      abi: abiBorrowerData,
      address: process.env
        .NEXT_PUBLIC_BORROWERDATA_CONTRACT_ADDRESS as `0x${string}`,
      functionName: "getPositionData",
      args: [
        {
          token: collateralInfo.addressLP,
          borrower: account.address,
          amount: 0n,
          amount0: isEqualAddress(selectedAsset.address, token0.address)
            ? amount
            : 0n,
          amount1: isEqualAddress(selectedAsset.address, token1.address)
            ? amount
            : 0n,
          direction: false,
          direction0: isEqualAddress(selectedAsset.address, token0.address),
          direction1: isEqualAddress(selectedAsset.address, token1.address),
        },
      ],
    });

    const showImpact = new Promise<void>((resolve) => {
      useImpactStore.setState({
        open: true,
        title: "Confirm Borrow",
        simulate,
        transactionDetails: {
          title: "Borrow",
          amount,
          symbol: (
            <Image
              className="inline"
              src={selectedAsset.imgSrc}
              alt={selectedAsset.symbol}
              width={18}
              height={18}
            />
          ),
          decimals: collateralInfo.decimals,
          price: coinPrices[selectedAsset.symbol as keyof Coins],
        },
        impacts: [
          {
            label: "Collateral",
            symbol: (
              <PairIcon
                userCollateralsInfo={collateralInfo}
                reservesInfo={[token0, token1]}
                size="tiny"
                symbol={false}
                className="translate-y-1"
              />
            ),
            fromAmount: userDepositBalance,
            toAmount: userDepositBalance,
            fromDecimals: collateralInfo.decimals,
            toDecimals: collateralInfo.decimals,
            fromPrice: collatPrice,
            toPrice: collatPrice,
          },
          {
            label: token0.symbol,
            type: "loan",
            symbol: (
              <Image
                className="inline"
                src={token0.imgSrc}
                alt={token0.symbol}
                width={18}
                height={18}
              />
            ),
            fromAmount:
              BigInt(Math.round(borrowBalance.borrowBalanceA * 1e9)) *
              10n ** BigInt(token0.decimals - 9),
            toAmount: debt0,
            fromDecimals: token0.decimals,
            toDecimals: token0.decimals,
            fromPrice: coinPrices[token0.symbol as keyof Coins],
            toPrice: coinPrices[token0.symbol as keyof Coins],
          },
          {
            label: token1.symbol,
            type: "loan",
            symbol: (
              <Image
                className="inline"
                src={token1.imgSrc}
                alt={token1.symbol}
                width={18}
                height={18}
              />
            ),
            fromAmount:
              BigInt(Math.round(borrowBalance.borrowBalanceB * 1e9)) *
              10n ** BigInt(token1.decimals - 9),
            toAmount: debt1,
            fromDecimals: token1.decimals,
            toDecimals: token1.decimals,
            fromPrice: coinPrices[token1.symbol as keyof Coins],
            toPrice: coinPrices[token1.symbol as keyof Coins],
          },
        ],
        note: (
          <>
            <div className="flex justify-between">
              <div className="w-36">Collateral Factor</div>
              <div className="w-12">
                {formatPCTFactor(
                  bigIntToDecimal(
                    price.collateralFactor,
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
                  ) ?? 0,
                  2,
                )}
                x
              </div>
            </div>
          </>
        ),
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
        },
      });
    });
    await showImpact;
  };
}
