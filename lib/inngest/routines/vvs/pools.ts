import { DateTime } from 'luxon';
import { z } from 'zod';

const TokenSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    id: z.string(),
    decimals: z.coerce.number(),
});

const PairSchema = z.object({
    id: z.string(),
    reserveUSD: z.coerce.number(),
    timestamp: z.coerce.number(),
    totalTransactions: z.coerce.number(),
    token0: TokenSchema,
    token1: TokenSchema,
});

const ResponseSchema = z.object({
    data: z.object({
        pairs: z.array(PairSchema),
    }),
});

type Pair = z.infer<typeof PairSchema>;
type QueryResponse = z.infer<typeof ResponseSchema>;

interface QueryVariables {
    first: number;
    skip: number;
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
        return ResponseSchema.parse(data);
    }
    throw new Error(`Query failed. Return code is ${response.status}. ${query}`);
}

export async function getVVSPool(n: number, m: number): Promise<Pair[]> {
    const query = `
    query($first: Int, $skip: Int) {
      pairs(
        first: $first
        skip: $skip
        where: { reserveUSD_gt: "50000", volumeUSD_gt: "5000" }
        orderBy: reserveUSD
        orderDirection: desc
      ) {
        id
        reserveUSD
        timestamp
        totalTransactions
        token0 {
          name
          symbol
          id
          decimals
        }
        token1 {
          name
          symbol
          id
          decimals
        }
      }
    }
  `;

    const pairs: Pair[] = [];

    for (let i = 0; i < m; i++) {
        const variables: QueryVariables = {
            first: n,
            skip: n * i,
        };

        try {
            const result = await runQuery(query, variables);
            pairs.push(...result.data.pairs);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    const pools: Pair[] = pairs.map((pair) => ({
        ...pair,
        timestamp: DateTime.fromSeconds(pair.timestamp).toJSDate().getTime(),
    }));

    return pools;
}
