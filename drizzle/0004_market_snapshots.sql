CREATE TABLE IF NOT EXISTS "market_snapshot" (
	"id_market_snapshot" serial PRIMARY KEY NOT NULL,
	"snapshot_at" timestamp with time zone NOT NULL,
	"chain_id" integer NOT NULL,
	"c_token" varchar(42) NOT NULL,
	"underlying" varchar(42) NOT NULL,
	"symbol" varchar NOT NULL,
	"underlying_symbol" varchar NOT NULL,
	"underlying_decimals" integer NOT NULL,
	"supply_apy" double precision NOT NULL,
	"borrow_apy" double precision NOT NULL,
	"utilization" double precision NOT NULL,
	"total_supply_usd" double precision NOT NULL,
	"total_borrows_usd" double precision NOT NULL,
	"available_liquidity_usd" double precision NOT NULL,
	"price_usd" double precision NOT NULL,
	"total_cash_raw" varchar(80) NOT NULL,
	"total_borrows_raw" varchar(80) NOT NULL,
	"total_reserves_raw" varchar(80) NOT NULL,
	"total_supply_raw" varchar(80) NOT NULL,
	"exchange_rate_raw" varchar(80) NOT NULL,
	"supply_rate_per_block_raw" varchar(80) NOT NULL,
	"borrow_rate_per_block_raw" varchar(80) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniqueMarketSnapshotEntry" ON "market_snapshot" ("chain_id","c_token","snapshot_at");
