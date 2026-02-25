import { describe, it, expect } from "bun:test";
import { getVVSPool } from "./pools";

describe("getVVSPool", () => {
  it("should fetch and return validated pools data", async () => {
    const n = 10;
    const m = 1;
    const pools = await getVVSPool(n, m);

    expect(pools).toBeDefined();
    expect(Array.isArray(pools)).toBe(true);
    expect(pools.length).toBeGreaterThan(0);

    if (pools.length > 0) {
      const pool = pools[0];
      if (!pool) throw new Error("Pool is undefined");
      expect(pool).toHaveProperty("id");
      expect(typeof pool.id).toBe("string");

      expect(pool).toHaveProperty("reserveUSD");
      expect(typeof pool.reserveUSD).toBe("number");

      expect(pool).toHaveProperty("timestamp");
      expect(typeof pool.timestamp).toBe("number");

      expect(pool).toHaveProperty("totalTransactions");
      expect(typeof pool.totalTransactions).toBe("number");

      expect(pool).toHaveProperty("token0");
      expect(pool.token0).toHaveProperty("name");
      expect(typeof pool.token0?.name).toBe("string");
      expect(pool.token0).toHaveProperty("symbol");
      expect(typeof pool.token0?.symbol).toBe("string");
      expect(pool.token0).toHaveProperty("id");
      expect(typeof pool.token0?.id).toBe("string");
      expect(pool.token0).toHaveProperty("decimals");
      expect(typeof pool.token0?.decimals).toBe("number");

      expect(pool).toHaveProperty("token1");
      expect(pool.token1).toHaveProperty("name");
      expect(typeof pool.token1?.name).toBe("string");
      expect(pool.token1).toHaveProperty("symbol");
      expect(typeof pool.token1?.symbol).toBe("string");
      expect(pool.token1).toHaveProperty("id");
      expect(typeof pool.token1?.id).toBe("string");
      expect(pool.token1).toHaveProperty("decimals");
      expect(typeof pool.token1?.decimals).toBe("number");
    }
  }, 10000);
});
