import type { Analytics, Blockchain, Dex, Pool, Price, Token } from "@/db/schema";
import type { CollateralInfos, PoolType } from "../types/farm.types";
import type { ReserveInfo } from "../types/save.types";
import { getAddress, parseUnits } from "viem";

export type PoolTableRows = Analytics & {
    pool: Pool & {
        reservesInfo: ReserveInfo[];
        blockchain: Blockchain | null;
        dex: Dex | null;
        token_0: Token & {
            prices: Price[] | null;
        } | null;
        token_1: Token & {
            prices: Price[] | null;
        } | null;
    } | null;
};

export type PoolDetails = Pool & {
    reservesInfo: ReserveInfo[];
    analytics: Analytics[] | null;
    blockchain: Blockchain | null;
    dex: Dex | null;
    token_0: Token & {
        prices: Price[] | null;
    } | null;
    token_1: Token & {
        prices: Price[] | null;
    } | null;
} | null;

export const analyticsToCollateralInfo = (pool: Pool & {
    token_0: Token | null;
    token_1: Token | null;
    dex: Dex | null;
} | null, analytics: Analytics | null) => {
    const userCollateralInfo: CollateralInfos = {
        address: pool?.pool_address as `0x${string}`,
        addressLP: pool?.pool_address as `0x${string}`,
        decimals: pool?.token_0?.token_decimals as number,
        lpApr: Number(analytics?.lp_apy_3m),
        isActivated: true,
        liquidationPremium: 0n,
        liquidationThresholdInfo: {
            balancedLoanThreshold: 0n,
            buffer: 0n,
            unBalancedLoanThreshold: 0n
        },
        poolType: pool?.dex?.dex_name as PoolType,
        symbol: `${pool?.token_0?.token_symbol}/${pool?.token_1?.token_symbol}`,
        token_0: pool?.token_0?.token_address as `0x${string}`,
        token_1: pool?.token_1?.token_address as `0x${string}`,
        tokenInfo: {
            assets: [pool?.token_0?.token_address as `0x${string}`, pool?.token_1?.token_address as `0x${string}`],
            nbAssets: parseUnits(analytics?.quantity_token_lp?.toString() ?? "0", 18),
            router: "0x" as `0x${string}`,
        }
    };

    return userCollateralInfo;
}

export const tokenToReserveInfo = async (token?: Token | null, chain?: Blockchain | null) => {
    let imgSrc = token?.token_optional_image ?? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain?.blockchain_name.toLowerCase()}/assets/${token && getAddress(token.token_address)}/logo.png`;

    if (!token?.token_optional_image && !(await fetch(imgSrc).then(res => res.ok).catch(() => false))) {
        let chainId = chain?.chain_id ?? 1;
        if (chainId === 338) {
            chainId = 25;
        }
        const infoAPI = `https://cryptofonts-token-icon-api1.p.rapidapi.com/${chainId}/${token && getAddress(token.token_address)}`;
        const res = await fetch(infoAPI, {
            headers: {
                "x-rapidapi-host": "cryptofonts-token-icon-api1.p.rapidapi.com",
                "x-rapidapi-key": process.env.XAPI_KEY!
            }
        }).then(res => res.json()).catch(() => null);

        imgSrc = res?.[0]?.logoURI
    }

    return {
        address: token?.token_address as `0x${string}`,
        decimals: token?.token_decimals as number,
        symbol: token?.token_symbol as string,
        imgSrc,
        debt: 0n,
        fee: {
            flashLoanFee: 0n,
            interestFee: 0n,
            loanFee: 0n
        },
        interestRateInfo: {
            interestRate: 0n,
            maxValue: 0n,
            minValue: 0n,
            optimalUtilizationRate: 0n,
            utilizationRate: 0n
        },
        isActivated: true,
        lastBlock: 0,
        lastTime: 0,
        supply: 0n,
        supplyCap: 0n,
        tokenInfo: {
            dToken: "0x" as `0x${string}`,
            dTokenPrice: 0n,
            lToken: "0x" as `0x${string}`,
            lTokenPrice: 0n,
        }
    } as ReserveInfo;
}