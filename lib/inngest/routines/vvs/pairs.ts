import { DateTime } from 'luxon';
import { z } from 'zod';

const TokenDataSchema = z.object({
    symbol: z.string(),
    derivedUSD: z.coerce.number(),
});

const PairDayDataSchema = z.object({
    date: z.coerce.number().or(z.date()),
    reserve0: z.coerce.number(),
    reserve1: z.coerce.number(),
    dailyVolumeToken0: z.coerce.number(),
    dailyVolumeToken1: z.coerce.number(),
    totalSupply: z.coerce.number(),
    token0: TokenDataSchema,
    token1: TokenDataSchema,
    return: z.number().optional(),
    liquidity: z.number().optional(),
    price: z.number().optional(),
    priceToken0inDollars: z.number().optional(),
    priceToken1inDollars: z.number().optional(),
});

const ResponseSchema = z.object({
    data: z.object({
        pairDayDatas: z.array(PairDayDataSchema),
    }),
});

type TokenData = z.infer<typeof TokenDataSchema>;
type PairDayData = z.infer<typeof PairDayDataSchema>;
type QueryResponse = z.infer<typeof ResponseSchema>;

interface QueryVariables {
    first: number;
    pairAddress: string;
}

async function runQuery(query: string, variables: QueryVariables): Promise<QueryResponse> {
    const response = await fetch('https://graph.cronoslabs.com/subgraphs/name/vvs/exchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (response.ok) {
        const data = await response.json();
        try {
            return ResponseSchema.parse(data);
        } catch (e) {
            console.log(data);
            console.error('Error parsing response:', e);
            throw e;
        }
    }
    throw new Error(`Query failed. Return code is ${response.status}. ${query}`);
}

export async function getPairDayData(pairAddress: string, nbDays: number): Promise<PairDayData[]> {
    const variables: QueryVariables = {
        first: nbDays,
        pairAddress: pairAddress,
    };

    const query = `
    query($first: Int, $pairAddress: String) {
      pairDayDatas(first: $first, orderBy: date, orderDirection: desc,
        where: {
          pairAddress: $pairAddress
        }
      ) {
        date
        reserve0
        reserve1
        dailyVolumeToken0
        dailyVolumeToken1
        totalSupply
        token0 {
          symbol
          derivedUSD
        }
        token1 {
          symbol
          derivedUSD
        }
      }
    }
  `;

    const result = await runQuery(query, variables);
    const pairDayDatas = result.data.pairDayDatas;

    const formattedData = pairDayDatas.map((dayData) => ({
        ...dayData,
        date: DateTime.fromSeconds(dayData.date as number).toJSDate(),
        liquidity: Math.sqrt(dayData.reserve0 * dayData.reserve1),
        price: dayData.reserve1 / dayData.reserve0,
    }));

    formattedData.forEach((dayData, index) => {
        if (index > 0) {
            dayData.return = formattedData[index].price / formattedData[index - 1].price - 1;
        } else {
            dayData.return = Number.NaN;
        }
    });

    return formattedData.reverse();
}

const TokenDayDataSchema = z.object({
    date: z.number().or(z.date()),
    priceUSD: z.coerce.number(),
});

const ResponseSchemaToken = z.object({
    data: z.object({
        tokenDayDatas: z.array(TokenDayDataSchema),
    }),
});

type TokenDayData = z.infer<typeof TokenDayDataSchema>;
type QueryResponseToken = z.infer<typeof ResponseSchemaToken>;

interface QueryVariablesToken {
    first: number;
    skip: number;
    tokenAdress: string;
}

async function runQueryToken(query: string, variables: QueryVariablesToken): Promise<QueryResponseToken> {
    const response = await fetch('https://graph.cronoslabs.com/subgraphs/name/vvs/exchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (response.ok) {
        const data = await response.json();
        try {
            return ResponseSchemaToken.parse(data);
        } catch (e) {
            console.log(data);
            console.error('Error parsing response:', e);
            throw e;
        }
    }
    throw new Error(`Query failed. Return code is ${response.status}. ${query}`);
}

async function getTokenDayData(tokenAddress: string, nbDays: number): Promise<TokenDayData[]> {
    const query = `
    query($first: Int, $skip: Int, $tokenAdress: String) {
      tokenDayDatas(first: $first, skip: $skip, orderBy: date, orderDirection: desc,
        where: {
          token_: {
            id: $tokenAdress
          }
        }
      ) {
        date
        priceUSD
      }
    }
  `;

    const m = 1;
    const tokenDayData: TokenDayData[] = [];

    for (let i = 0; i < m; i++) {
        const variables: QueryVariablesToken = {
            first: nbDays,
            skip: nbDays * i,
            tokenAdress: tokenAddress,
        };

        const result = await runQueryToken(query, variables);

        const formattedData = result.data.tokenDayDatas.map((dayData) => ({
            ...dayData,
            date: DateTime.fromSeconds(dayData.date as number).toJSDate(),
        }));

        tokenDayData.push(...formattedData);
    }

    return tokenDayData.reverse();
}


interface ExtendedPairDayData extends PairDayData {
    totalVolume: number;
    lp_apy_1d: number;
    lp_versus_hold_apy_1d: number;
    fees_apy_1d: number;
    il_apy_1d: number;
    hold_apy_1d: number;
    lp_apy_1m: number;
    lp_versus_hold_apy_1m: number;
    fees_apy_1m: number;
    il_apy_1m: number;
    hold_apy_1m: number;
    lp_apy_3m: number;
    lp_versus_hold_apy_3m: number;
    fees_apy_3m: number;
    il_apy_3m: number;
    hold_apy_3m: number;
    lp_apy_1y: number;
    lp_versus_hold_apy_1y: number;
    fees_apy_1y: number;
    il_apy_1y: number;
    hold_apy_1y: number;
}

function calculateTotalVolume(pairDayData: PairDayData[]): (PairDayData & { totalVolume: number })[] {
    return pairDayData.map((dayData) => ({
        ...dayData,
        totalVolume: dayData.dailyVolumeToken0 * (dayData.priceToken0inDollars ?? 0),
    }));
}

function calculateAPYs(pairDayData: PairDayData[], startDelayPairs: { start: number; delay: number }[], amount: number, fees: number, adj_fees: number): ExtendedPairDayData[] {
    const N = pairDayData.length;

    const extendedPairDayData: ExtendedPairDayData[] = pairDayData.map((dayData) => ({
        ...dayData,
        totalVolume: 0,
        lp_apy_1d: 0,
        lp_versus_hold_apy_1d: 0,
        fees_apy_1d: 0,
        il_apy_1d: 0,
        hold_apy_1d: 0,
        lp_apy_1m: 0,
        lp_versus_hold_apy_1m: 0,
        fees_apy_1m: 0,
        il_apy_1m: 0,
        hold_apy_1m: 0,
        lp_apy_3m: 0,
        lp_versus_hold_apy_3m: 0,
        fees_apy_3m: 0,
        il_apy_3m: 0,
        hold_apy_3m: 0,
        lp_apy_1y: 0,
        lp_versus_hold_apy_1y: 0,
        fees_apy_1y: 0,
        il_apy_1y: 0,
        hold_apy_1y: 0,
    }));

    for (const { start, delay } of startDelayPairs) {
        const X = 365 / delay;
        for (let i = start; i < N; i++) {
            if (i - delay < 0) continue; // Ensure the slice doesn't go out of bounds

            // Calculate reserves and prices
            const qToken0_current = pairDayData.slice(i - delay, i).map((dayData) => dayData.reserve0 / dayData.totalSupply);
            const qToken1_current = pairDayData.slice(i - delay, i).map((dayData) => dayData.reserve1 / dayData.totalSupply);

            let plp_current = qToken0_current.map((qt0, index) => qt0 * (pairDayData[i - delay + index].priceToken0inDollars ?? 0));
            plp_current = plp_current.map((plp, index) => plp + qToken1_current[index] * (pairDayData[i - delay + index].priceToken1inDollars ?? 0));

            const qty_current = amount / plp_current[0];
            plp_current = plp_current.map((plp) => qty_current * plp);

            const volume_current = pairDayData.slice(i - delay, i).map((dayData) => dayData.dailyVolumeToken0 * (dayData.priceToken0inDollars ?? 0));

            // Calculate fees current
            let fees_current = volume_current.slice(1).map((vol, index) => qty_current * vol * fees * adj_fees / 100 / pairDayData[i - delay + index + 1].totalSupply);
            fees_current = [0, ...fees_current];

            let hold_current = pairDayData.slice(i - delay, i).map((dayData) => qToken0_current[0] * (dayData.priceToken0inDollars ?? 0) + qToken1_current[0] * (dayData.priceToken1inDollars ?? 0));
            hold_current = hold_current.map((hold) => qty_current * hold);

            const perf_hodl_current = (hold_current[hold_current.length - 1] - hold_current[0]) / hold_current[0];
            const perf_fees_current = fees_current.reduce((sum, fee) => sum + fee, 0) / hold_current[0];
            const perf_il_current = Math.min((plp_current[plp_current.length - 1] - fees_current.reduce((sum, fee) => sum + fee, 0) - hold_current[hold_current.length - 1]) / hold_current[0], 0);

            const current_lp_apy = (1 + perf_hodl_current + perf_fees_current + perf_il_current) ** X - 1;
            const current_lp_versus_hold_apy = (1 + perf_fees_current + perf_il_current) ** X - 1;
            const current_fees_apy = (1 + perf_fees_current) ** X - 1;
            const current_il_apy = (1 + perf_il_current) ** X - 1;
            const current_hold_apy = (1 + perf_hodl_current) ** X - 1;

            if (delay === 1) {
                extendedPairDayData[i] = {
                    ...extendedPairDayData[i],
                    lp_apy_1d: current_lp_apy,
                    lp_versus_hold_apy_1d: current_lp_versus_hold_apy,
                    fees_apy_1d: current_fees_apy,
                    il_apy_1d: current_il_apy,
                    hold_apy_1d: current_hold_apy,
                };
            } else if (delay === 30) {
                extendedPairDayData[i] = {
                    ...extendedPairDayData[i],
                    lp_apy_1m: current_lp_apy,
                    lp_versus_hold_apy_1m: current_lp_versus_hold_apy,
                    fees_apy_1m: current_fees_apy,
                    il_apy_1m: current_il_apy,
                    hold_apy_1m: current_hold_apy,
                };
            } else if (delay === 3 * 30) {
                extendedPairDayData[i] = {
                    ...extendedPairDayData[i],
                    lp_apy_3m: current_lp_apy,
                    lp_versus_hold_apy_3m: current_lp_versus_hold_apy,
                    fees_apy_3m: current_fees_apy,
                    il_apy_3m: current_il_apy,
                    hold_apy_3m: current_hold_apy,
                };
            } else if (delay === 365) {
                extendedPairDayData[i] = {
                    ...extendedPairDayData[i],
                    lp_apy_1y: current_lp_apy,
                    lp_versus_hold_apy_1y: current_lp_versus_hold_apy,
                    fees_apy_1y: current_fees_apy,
                    il_apy_1y: current_il_apy,
                    hold_apy_1y: current_hold_apy,
                };
            }
        }
    }

    return extendedPairDayData;
}


export async function updatePairDayData(pairDayData: PairDayData[], token0Address: string, token1Address: string, nbDays: number): Promise<ExtendedPairDayData[]> {
    const token0DayData = await getTokenDayData(token0Address, nbDays);
    const token1DayData = await getTokenDayData(token1Address, nbDays);

    const updatedPairDayData = pairDayData.map((dayData) => {
        const token0Price = token0DayData.find((token0Data) => DateTime.fromJSDate(token0Data.date as Date).startOf('day').equals(DateTime.fromJSDate(dayData.date as Date).startOf('day')))?.priceUSD ?? 0;
        const token1Price = token1DayData.find((token1Data) => DateTime.fromJSDate(token1Data.date as Date).startOf('day').equals(DateTime.fromJSDate(dayData.date as Date).startOf('day')))?.priceUSD ?? 0;

        return {
            ...dayData,
            priceToken0inDollars: token0Price,
            priceToken1inDollars: token1Price,
        };
    });

    const pairDayDataWithTotalVolume = calculateTotalVolume(updatedPairDayData);

    const startDelayPairs = [
        // { start: 1, delay: 1 },
        { start: 30, delay: 30 },
        { start: 3 * 30, delay: 3 * 30 },
        { start: 365, delay: 365 },
    ];

    const amount = 100;
    const fees = 0.3; // Replace with the actual fees value
    const adj_fees = 0.8; // Replace with the actual adjusted fees value

    const extendedPairDayData = calculateAPYs(pairDayDataWithTotalVolume, startDelayPairs, amount, fees, adj_fees);

    return extendedPairDayData;
}
