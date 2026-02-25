import { db } from "@/db/db";
import { tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import { getBorrowApy } from "@/lib/helpers/borrow.helpers";
import type { ReserveInfo } from "@/lib/types/save.types";
import { DateTime } from "luxon";
import type { Address } from "viem";
import { z } from "zod";

const TokenDataSchema = z.object({
  id: z.string(),
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

export type PairDayData = z.infer<typeof PairDayDataSchema>;
type QueryResponse = z.infer<typeof ResponseSchema>;

interface QueryVariables {
  first: number;
  pairAddress: string;
}

async function runQuery(
  query: string,
  variables: QueryVariables,
): Promise<QueryResponse> {
  const response = await fetch(
    "https://graph.cronoslabs.com/subgraphs/name/vvs/exchange",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (response.ok) {
    const data = await response.json();
    try {
      return ResponseSchema.parse(data);
    } catch (e) {
      console.log("pairs", data);
      console.error("Error parsing response:", e);
      throw e;
    }
  }
  throw new Error(`Query failed. Return code is ${response.status}. ${query}`);
}

export async function getPairDayData(
  pairAddress: string,
  nbDays: number,
): Promise<PairDayData[]> {
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
		  id
          symbol
          derivedUSD
        }
        token1 {
		  id
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
    priceToken0inDollars: dayData.token0.derivedUSD,
    priceToken1inDollars: dayData.token1.derivedUSD,
  }));

  formattedData.forEach((dayData, index) => {
    const currentPrice = formattedData[index]?.price;
    const prevPrice = index > 0 ? formattedData[index - 1]?.price : undefined;

    if (
      index > 0 &&
      currentPrice !== undefined &&
      prevPrice !== undefined &&
      prevPrice !== 0
    ) {
      dayData.return = currentPrice / prevPrice - 1;
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

async function runQueryToken(
  query: string,
  variables: QueryVariablesToken,
): Promise<QueryResponseToken> {
  const response = await fetch(
    "https://graph.cronoslabs.com/subgraphs/name/vvs/exchange",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (response.ok) {
    const data = await response.json();
    try {
      return ResponseSchemaToken.parse(data);
    } catch (e) {
      console.log(data);
      console.error("Error parsing response:", e);
      throw e;
    }
  }
  throw new Error(`Query failed. Return code is ${response.status}. ${query}`);
}

async function getTokenDayData(
  tokenAddress: string,
  nbDays: number,
): Promise<TokenDayData[]> {
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

  const variables: QueryVariablesToken = {
    first: nbDays,
    skip: 0,
    tokenAdress: tokenAddress,
  };

  const result = await runQueryToken(query, variables);

  const formattedData = result.data.tokenDayDatas.map((dayData) => ({
    ...dayData,
    date: DateTime.fromSeconds(dayData.date as number).toJSDate(),
  }));

  const tokenDayData: TokenDayData[] = formattedData;

  return tokenDayData.reverse();
}

interface ExtendedPairDayData extends PairDayData {
  mrm: number;
  volatility_score: number;
  lrm: number;
  liquidity_score: number;
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

function calculateTotalVolume(
  pairDayData: PairDayData[],
): (PairDayData & { totalVolume: number })[] {
  return pairDayData.map((dayData) => ({
    ...dayData,
    totalVolume:
      dayData.dailyVolumeToken0 * (dayData.priceToken0inDollars ?? 0),
  }));
}

async function calculateAPYs(
  pool_address: `0x${string}`,
  pairDayData: PairDayData[],
  startDelayPairs: number[],
  amount: number,
  fees: number,
  adj_fees: number,
): Promise<ExtendedPairDayData[]> {
  const analyticsResult = await db.query.pool.findFirst({
    where: (row, { eq }) => eq(row.pool_address, pool_address),
    with: {
      blockchain: true,
      dex: true,
      token_0: true,
      token_1: true,
    },
  });

  if (!analyticsResult) {
    return [];
  }

  const hasMirrored = await db.query.pool.findFirst({
    where: (row, { eq }) => eq(row.mirror_pool, analyticsResult?.id_pool),
    columns: {
      pool_address: true,
    },
    with: {
      blockchain: {
        columns: {
          chain_id: true,
        },
      },
      token_0: {
        columns: {
          token_address: true,
        },
      },
      token_1: {
        columns: {
          token_address: true,
        },
      },
    },
  });

  const reservesInfo: ReserveInfo[] = await Promise.all([
    tokenToReserveInfo(
      analyticsResult?.token_0,
      analyticsResult?.blockchain,
      (hasMirrored?.token_0?.token_address ??
        analyticsResult?.token_0?.token_address) as Address,
      (hasMirrored?.blockchain?.chain_id ??
        analyticsResult?.blockchain?.chain_id) as number,
    ),
    tokenToReserveInfo(
      analyticsResult?.token_1,
      analyticsResult?.blockchain,
      (hasMirrored?.token_1?.token_address ??
        analyticsResult?.token_1?.token_address) as Address,
      (hasMirrored?.blockchain?.chain_id ??
        analyticsResult?.blockchain?.chain_id) as number,
    ),
  ]);

  const r_0 = getBorrowApy(reservesInfo?.[0]) ?? 1 / 100;
  const r_1 = getBorrowApy(reservesInfo?.[1]) ?? 1 / 100;

  // Moyenne sur les deux taux(Uni V2 on emprunte la même "valeur" de token 0 / 1)
  const r = 0.5 * (r_0 + r_1);

  const extendedPairDayData: ExtendedPairDayData[] = pairDayData.map(
    (dayData) => ({
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
      // Others
      mrm: 0,
      volatility_score: 0,
      lrm: 0,
      liquidity_score: 0,
    }),
  );

  for (const delay of startDelayPairs) {
    for (let i = 365; i < extendedPairDayData.length; i++) {
      // Need at least 365 days to compute APY
      const data = extendedPairDayData.slice(i - delay, i);

      let plp: number[] =
        data.map((analytic, i) => {
          const qToken0 = analytic.reserve0 / analytic.totalSupply;
          const qToken1 = analytic.reserve1 / analytic.totalSupply;

          const price0 = analytic.priceToken0inDollars ?? 0;
          const price1 = analytic.priceToken1inDollars ?? 0;

          const plp = qToken0 * price0 + qToken1 * price1;
          return plp;
        }) ?? [];

      if (plp.length === 0 || plp[0] === undefined) {
        continue;
      }
      const qty = amount / plp[0];
      plp = plp.map((val) => qty * val);

      const totalVolume =
        data.map((info, i) => {
          const price0 = info.priceToken0inDollars ?? 0;

          return info.dailyVolumeToken0 * price0;
        }) ?? [];

      let _fees: number[] = totalVolume
        .slice(1)
        .map(
          (val, i) =>
            (val * fees * adj_fees * qty) / 100 / (data[i]?.totalSupply ?? 0),
        );
      _fees = [0.0, ..._fees];
      _fees = _fees.reduce((acc, val) => {
        const lastVal = acc[acc.length - 1];
        acc.push((lastVal !== undefined ? lastVal : 0) + val);
        return acc;
      }, [] as number[]);

      const hold: number[] = data.map((info, i) => {
        const qToken0 = (data[0]?.reserve0 ?? 0) / (data[0]?.totalSupply ?? 0);
        const qToken1 = (data[0]?.reserve1 ?? 0) / (data[0]?.totalSupply ?? 0);

        const price0 = info.priceToken0inDollars ?? 0;
        const price1 = info.priceToken1inDollars ?? 0;

        return qty * (qToken0 * price0 + qToken1 * price1);
      });

      const il = hold.map((val, i) => {
        const plpVal = plp[i] ?? 0;
        const feesVal = _fees[i] ?? 0;
        return Math.min(plpVal - feesVal - val, 0);
      });

      const interest = Array.from(
        { length: delay },
        (_, i) => (-amount * r * i) / 365,
      );
      const L = 1;
      const lp = data.map((_, i) => {
        const holdVal = hold[i] ?? 0;
        const feesVal = _fees[i] ?? 0;
        const ilVal = il[i] ?? 0;
        const interestVal = interest[i] ?? 0;
        return holdVal + L * feesVal + L * ilVal + (L - 1) * interestVal;
      });
      const lpVsHold = data.map((_, i) => {
        const feesVal = _fees[i] ?? 0;
        const ilVal = il[i] ?? 0;
        const interestVal = interest[i] ?? 0;
        return L * feesVal + L * ilVal + (L - 1) * interestVal;
      });

      const lastHold = hold[hold.length - 1];
      const firstHold = hold[0];
      const lastLp = lp[lp.length - 1];
      const firstLp = lp[0];
      const lastFees = _fees[_fees.length - 1];
      const lastIl = il[il.length - 1];
      const lastLpVsHold = lpVsHold[lpVsHold.length - 1];

      if (
        lastHold === undefined ||
        firstHold === undefined ||
        lastLp === undefined ||
        firstLp === undefined ||
        lastFees === undefined ||
        lastIl === undefined ||
        lastLpVsHold === undefined ||
        firstHold === 0
      ) {
        continue;
      }

      let holdApy = (lastHold - firstHold) / firstHold;
      let lpApy = (lastLp - firstLp) / firstLp;
      let feesApy = lastFees / firstHold;
      let ilApy = lastIl / firstHold;
      let lpVsHoldApy = lastLpVsHold / firstHold;

      const annualization = 365 / delay;

      lpApy = (1 + lpApy) ** annualization - 1;
      holdApy = (1 + holdApy) ** annualization - 1;
      feesApy = (1 + feesApy) ** annualization - 1;
      ilApy = (1 + ilApy) ** annualization - 1;
      lpVsHoldApy = (1 + lpVsHoldApy) ** annualization - 1;

      // Assuming daily compounding (adjust 'n' based on your compounding frequency)
      // const n = 365;

      // // Annualized APY
      // const holdApy = (1 + holdApr / n) ** n - 1;
      // const lpApy = (1 + lpApr / n) ** n - 1;
      // const lpVsHoldApy = (1 + lpVsHoldApr / n) ** n - 1;
      // const interestApy = (1 + interestApr / n) ** n - 1;
      // const feesApy = (1 + feesApr / n) ** n - 1;

      if (
        i === extendedPairDayData.length - 1 &&
        delay === 90 &&
        analyticsResult?.pool_address.toLowerCase() ===
          "0x39cc0e14795a8e6e9d02a21091b81fe0d61d82f9".toLowerCase()
      ) {
        // debugger;
        // Print for debug
        console.log(
          `Pair ${analyticsResult?.token_0?.token_symbol} / ${analyticsResult?.token_1?.token_symbol}`,
        );
        console.log(hold.slice(-10));
        // APR
        // console.log(`Hold APR: ${holdApr}`);
        // console.log(`LP APR: ${lpApr}`);
        // console.log(`LP vs Hold APR: ${lpVsHoldApr}`);
        // console.log(`Interest APR: ${interestApr}`);
        // APY
        console.log(`Hold APY: ${holdApy}`);
        console.log(`LP APY: ${lpApy}`);
        console.log(`Fees APY: ${feesApy}`);
        console.log(`LP vs Hold APY: ${lpVsHoldApy}`);
        console.log(`Impermanent Loss APY: ${ilApy}`);
        console.log(`Delay: ${delay}`);
      }

      const item = extendedPairDayData[i];
      if (!item) continue;
      switch (delay) {
        case 1:
          item.hold_apy_1d = holdApy;
          item.lp_apy_1d = lpApy;
          item.lp_versus_hold_apy_1d = lpVsHoldApy;
          item.fees_apy_1d = feesApy;
          item.il_apy_1d = ilApy;
          break;
        case 30:
          item.hold_apy_1m = holdApy;
          item.lp_apy_1m = lpApy;
          item.lp_versus_hold_apy_1m = lpVsHoldApy;
          item.fees_apy_1m = feesApy;
          item.il_apy_1m = ilApy;
          break;
        case 90:
          item.hold_apy_3m = holdApy;
          item.lp_apy_3m = lpApy;
          item.lp_versus_hold_apy_3m = lpVsHoldApy;
          item.fees_apy_3m = feesApy;
          item.il_apy_3m = ilApy;
          break;
        case 365:
          item.hold_apy_1y = holdApy;
          item.lp_apy_1y = lpApy;
          item.lp_versus_hold_apy_1y = lpVsHoldApy;
          item.fees_apy_1y = feesApy;
          item.il_apy_1y = ilApy;
          break;
      }
    }
  }
  return extendedPairDayData;
}

function calculateScores(extendedPairDayData: ExtendedPairDayData[]) {
  const start = 365;
  const delay = 365;

  const T = 1;
  const nDays = 256;
  const n = T * nDays;

  const ThresholdsVeV = [5, 10, 15, 30, 50, 80];

  const N = extendedPairDayData.length;
  const volatilityScore = new Array(N - start).fill(0);
  const mrm = new Array(N - start).fill(0);

  for (let i = start; i < N; i++) {
    const priceCurrent = extendedPairDayData
      .slice(i - delay, i)
      .map((dayData) => dayData.price ?? 0);
    const returnCurrent = priceCurrent.slice(1).map((price, index) => {
      const prevPrice = priceCurrent[index];
      return prevPrice !== undefined && prevPrice !== 0
        ? price / prevPrice - 1
        : 0;
    });

    const logReturnCurrent = returnCurrent
      .slice(1)
      .map((ret) => Math.log(ret + 1));

    const currentMean =
      logReturnCurrent.reduce((sum, val) => sum + val, 0) /
      logReturnCurrent.length;
    const currentSigma = Math.sqrt(
      logReturnCurrent.reduce((sum, val) => sum + (val - currentMean) ** 2, 0) /
        logReturnCurrent.length,
    );
    const currentS =
      logReturnCurrent.reduce((sum, val) => sum + (val - currentMean) ** 3, 0) /
      (logReturnCurrent.length * currentSigma ** 3);
    const currentK =
      logReturnCurrent.reduce((sum, val) => sum + (val - currentMean) ** 4, 0) /
        (logReturnCurrent.length * currentSigma ** 4) -
      3;

    const currentVaR =
      currentSigma *
        Math.sqrt(n) *
        (-1.96 +
          (0.474 * currentS) / Math.sqrt(n) -
          (0.0687 * currentK) / n +
          (0.146 * currentS ** 2) / n) -
      0.5 * currentSigma ** 2 * n;
    let currentVeV = Math.sqrt(3.842 - 2 * currentVaR) - 1.96;
    currentVeV = currentVeV / Math.sqrt(T);

    let categorieVeV = 0;
    const t0 = ThresholdsVeV[0] ?? 0;
    const t1 = ThresholdsVeV[1] ?? 0;
    const t2 = ThresholdsVeV[2] ?? 0;
    const t3 = ThresholdsVeV[3] ?? 0;
    const t4 = ThresholdsVeV[4] ?? 0;
    const t5 = ThresholdsVeV[5] ?? 0;

    if (currentVeV * 100 < t0) {
      categorieVeV = 1;
    } else if (t0 <= currentVeV * 100 && currentVeV * 100 < t1) {
      categorieVeV = 2;
    } else if (t1 <= currentVeV * 100 && currentVeV * 100 < t2) {
      categorieVeV = 3;
    } else if (t2 <= currentVeV * 100 && currentVeV * 100 < t3) {
      categorieVeV = 4;
    } else if (t3 <= currentVeV * 100 && currentVeV * 100 < t4) {
      categorieVeV = 5;
    } else if (t4 <= currentVeV * 100 && currentVeV * 100 < t5) {
      categorieVeV = 6;
    } else if (t5 <= currentVeV * 100) {
      categorieVeV = 7;
    }

    volatilityScore[i] = currentVeV;
    mrm[i] = categorieVeV ?? 0;
  }

  for (let i = 0; i < extendedPairDayData.length; i++) {
    const item = extendedPairDayData[i];
    if (item) {
      item.volatility_score = volatilityScore[i] ?? 0;
      item.mrm = mrm[i] ?? 0;
    }
  }

  return extendedPairDayData;
}

export async function updatePairDayData(
  pairDayData: PairDayData[],
  pool_address: string,
  token0Address: string,
  token1Address: string,
  nbDays: number,
): Promise<ExtendedPairDayData[]> {
  const token0DayData = await getTokenDayData(token0Address, nbDays);
  const token1DayData = await getTokenDayData(token1Address, nbDays);

  const updatedPairDayData = pairDayData.map((dayData, i) => {
    const token0Price = token0DayData[i]?.priceUSD ?? 0;
    const token1Price = token1DayData[i]?.priceUSD ?? 0;
    return {
      ...dayData,
      priceToken0inDollars: token0Price,
      priceToken1inDollars: token1Price,
    };
    // 	token0DayData.find((token0Data) =>
    // 		DateTime.fromJSDate(token0Data.date as Date)
    // 			.startOf("day")
    // 			.equals(DateTime.fromJSDate(dayData.date as Date).startOf("day")),
    // 	)?.priceUSD ?? 0;
    // const token1Price =
    // 	token1DayData.find((token1Data) =>
    // 		DateTime.fromJSDate(token1Data.date as Date)
    // 			.startOf("day")
    // 			.equals(DateTime.fromJSDate(dayData.date as Date).startOf("day")),
    // 	)?.priceUSD ?? 0;

    // return {
    // 	...dayData,
    // 	priceToken0inDollars: token0Price,
    // 	priceToken1inDollars: token1Price,
    // };
  });

  console.log("token0DayData", token0DayData.length, token0DayData.slice(0, 5));
  console.log("token1DayData", token1DayData.length, token1DayData.slice(0, 5));

  const pairDayDataWithTotalVolume = calculateTotalVolume(updatedPairDayData);

  const startDelayPairs = [1, 30, 90, 365];

  const amount = 100;
  const fees = 0.3; // Replace with the actual fees value
  const adj_fees = 2 / 3; // Replace with the actual adjusted fees value

  let extendedPairDayData = await calculateAPYs(
    pool_address as Address,
    pairDayDataWithTotalVolume,
    startDelayPairs,
    amount,
    fees,
    adj_fees,
  );

  console.log(
    "Last extendedPairDayData",
    extendedPairDayData[extendedPairDayData.length - 1],
  );

  extendedPairDayData = calculateScores(extendedPairDayData);

  return extendedPairDayData;
}
