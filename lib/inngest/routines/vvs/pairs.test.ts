import { describe, expect, it } from "bun:test";
import { getPairDayData, updatePairDayData } from "./pairs";
import { plot, Plot } from 'nodeplotlib';

describe("getPairDayData", () => {
	it.skip("should fetch and return validated pair day data", async () => {
		const pairAddress = "0xbf62c67ea509e86f07c8c69d0286c0636c50270b";
		const nbDays = 2 * 365;

		const pairDayData = await getPairDayData(pairAddress, nbDays);

		expect(pairDayData).toBeDefined();
		expect(Array.isArray(pairDayData)).toBe(true);
		expect(pairDayData.length).toBeLessThanOrEqual(nbDays);
		expect(pairDayData.length).toBeGreaterThan(0);

		if (pairDayData.length > 0) {
			const dayData = pairDayData[0];
			expect(dayData).toHaveProperty("date");
			expect(dayData.date).toBeInstanceOf(Date);

			expect(dayData).toHaveProperty("reserve0");
			expect(typeof dayData.reserve0).toBe("number");

			expect(dayData).toHaveProperty("reserve1");
			expect(typeof dayData.reserve1).toBe("number");

			expect(dayData).toHaveProperty("dailyVolumeToken0");
			expect(typeof dayData.dailyVolumeToken0).toBe("number");

			expect(dayData).toHaveProperty("dailyVolumeToken1");
			expect(typeof dayData.dailyVolumeToken1).toBe("number");

			expect(dayData).toHaveProperty("totalSupply");
			expect(typeof dayData.totalSupply).toBe("number");

			expect(dayData).toHaveProperty("token0");
			expect(dayData.token0).toHaveProperty("symbol");
			expect(typeof dayData.token0.symbol).toBe("string");
			expect(dayData.token0).toHaveProperty("derivedUSD");
			expect(typeof dayData.token0.derivedUSD).toBe("number");

			expect(dayData).toHaveProperty("token1");
			expect(dayData.token1).toHaveProperty("symbol");
			expect(typeof dayData.token1.symbol).toBe("string");
			expect(dayData.token1).toHaveProperty("derivedUSD");
			expect(typeof dayData.token1.derivedUSD).toBe("number");

			expect(dayData).toHaveProperty("liquidity");
			expect(typeof dayData.liquidity).toBe("number");

			expect(dayData).toHaveProperty("price");
			expect(typeof dayData.price).toBe("number");

			expect(dayData).toHaveProperty("return");
			expect(typeof dayData.return).toBe("number");
		}
	}, 50000);
});

describe("updatePairDayData", () => {
	it("should update pair day data with token prices and non-zero APYs", async () => {
		const pairAddress = "0x814920d1b8007207db6cb5a2dd92bf0b082bdba1";
		const nbDays = 2 * 365;

		const pairDayData = await getPairDayData(pairAddress, nbDays);
		const updatedPairDayData = await updatePairDayData(
			pairDayData,
            pairAddress,
			pairDayData[0].token0.id,
			pairDayData[0].token1.id,
			nbDays,
		);

        const latest = updatedPairDayData[updatedPairDayData.length - 1];

        console.log(latest);
        
		const chart: Plot = {
            type: "scatter",
            x: updatedPairDayData.map((d) => d.date),
            y: updatedPairDayData.map((d) => d.price ?? 0),
            name: "price",
        }

        plot([chart]);

        await Bun.sleep(Number.MAX_SAFE_INTEGER);

		expect(updatedPairDayData).toBeDefined();
		expect(Array.isArray(updatedPairDayData)).toBe(true);
		expect(updatedPairDayData.length).toBe(pairDayData.length);

		if (updatedPairDayData.length > 0) {
			const dayData = updatedPairDayData[0];
			expect(dayData).toHaveProperty("date");
			expect(dayData.date).toBeInstanceOf(Date);

			expect(dayData).toHaveProperty("reserve0");
			expect(typeof dayData.reserve0).toBe("number");

			expect(dayData).toHaveProperty("reserve1");
			expect(typeof dayData.reserve1).toBe("number");

			expect(dayData).toHaveProperty("dailyVolumeToken0");
			expect(typeof dayData.dailyVolumeToken0).toBe("number");

			expect(dayData).toHaveProperty("dailyVolumeToken1");
			expect(typeof dayData.dailyVolumeToken1).toBe("number");

			expect(dayData).toHaveProperty("totalSupply");
			expect(typeof dayData.totalSupply).toBe("number");

			expect(dayData).toHaveProperty("token0");
			expect(dayData.token0).toHaveProperty("symbol");
			expect(typeof dayData.token0.symbol).toBe("string");
			expect(dayData.token0).toHaveProperty("derivedUSD");
			expect(typeof dayData.token0.derivedUSD).toBe("number");

			expect(dayData).toHaveProperty("token1");
			expect(dayData.token1).toHaveProperty("symbol");
			expect(typeof dayData.token1.symbol).toBe("string");
			expect(dayData.token1).toHaveProperty("derivedUSD");
			expect(typeof dayData.token1.derivedUSD).toBe("number");

			expect(dayData).toHaveProperty("liquidity");
			expect(typeof dayData.liquidity).toBe("number");

			expect(dayData).toHaveProperty("price");
			expect(typeof dayData.price).toBe("number");

			expect(dayData).toHaveProperty("return");
			expect(typeof dayData.return).toBe("number");

			expect(dayData).toHaveProperty("priceToken0inDollars");
			expect(typeof dayData.priceToken0inDollars).toBe("number");

			expect(dayData).toHaveProperty("priceToken1inDollars");
			expect(typeof dayData.priceToken1inDollars).toBe("number");

			expect(dayData.lp_apy_1d).toBeGreaterThan(0);
			expect(dayData.lp_versus_hold_apy_1d).not.toBe(0);
			expect(dayData.fees_apy_1d).toBeGreaterThanOrEqual(0);
			expect(dayData.il_apy_1d).toBeLessThanOrEqual(0);
			expect(dayData.hold_apy_1d).not.toBe(0);

			expect(dayData.lp_apy_1m).toBeGreaterThan(0);
			expect(dayData.lp_versus_hold_apy_1m).not.toBe(0);
			expect(dayData.fees_apy_1m).toBeGreaterThanOrEqual(0);
			expect(dayData.il_apy_1m).toBeLessThanOrEqual(0);
			expect(dayData.hold_apy_1m).not.toBe(0);

			expect(dayData.lp_apy_3m).toBeGreaterThan(0);
			expect(dayData.lp_versus_hold_apy_3m).not.toBe(0);
			expect(dayData.fees_apy_3m).toBeGreaterThanOrEqual(0);
			expect(dayData.il_apy_3m).toBeLessThanOrEqual(0);
			expect(dayData.hold_apy_3m).not.toBe(0);

			expect(dayData.lp_apy_1y).toBeGreaterThan(0);
			expect(dayData.lp_versus_hold_apy_1y).not.toBe(0);
			expect(dayData.fees_apy_1y).toBeGreaterThanOrEqual(0);
			expect(dayData.il_apy_1y).toBeLessThanOrEqual(0);
			expect(dayData.hold_apy_1y).not.toBe(0);
		}
	}, 0);
});
