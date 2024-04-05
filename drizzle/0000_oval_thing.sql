CREATE TABLE IF NOT EXISTS "analytics" (
	"id_analytics" serial PRIMARY KEY NOT NULL,
	"id_pool" integer,
	"date" date,
	"quantity_token_0" numeric(78, 0),
	"quantity_token_1" numeric(78, 0),
	"quantity_token_lp" numeric(78, 0),
	"volume_token_0" numeric(78, 0),
	"volume_token_1" numeric(78, 0),
	"mrm" double precision,
	"volatility_score" double precision,
	"lrm" double precision,
	"liquidity_score" double precision,
	"lp_apy_1d" double precision,
	"lp_vs_hold_apy_1d" double precision,
	"fee_apy_1d" double precision,
	"il_apy_1d" double precision,
	"hold_apy_1d" double precision,
	"lp_apy_1m" double precision,
	"lp_vs_hold_apy_1m" double precision,
	"fee_apy_1m" double precision,
	"il_apy_1m" double precision,
	"hold_apy_1m" double precision,
	"lp_apy_3m" double precision,
	"lp_vs_hold_apy_3m" double precision,
	"fee_apy_3m" double precision,
	"il_apy_3m" double precision,
	"hold_apy_3m" double precision,
	"lp_apy_1y" double precision,
	"lp_vs_hold_apy_1y" double precision,
	"fee_apy_1y" double precision,
	"il_apy_1y" double precision,
	"hold_apy_1y" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blockchain" (
	"id_blockchain" serial PRIMARY KEY NOT NULL,
	"blockchain_name" varchar NOT NULL,
	"blockchain_type" varchar NOT NULL,
	"chain_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dex" (
	"id_dex" serial PRIMARY KEY NOT NULL,
	"dex_name" varchar NOT NULL,
	"dex_type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pool" (
	"id_pool" serial PRIMARY KEY NOT NULL,
	"pool_address" varchar NOT NULL,
	"pool_fee" numeric(5, 2),
	"pool_creation_date" date,
	"id_token_0" integer,
	"id_token_1" integer,
	"id_dex" integer,
	"id_blockchain" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "price" (
	"id_price" serial PRIMARY KEY NOT NULL,
	"id_token" integer,
	"date" date,
	"price" double precision,
	"price_currency" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token" (
	"id_token" serial PRIMARY KEY NOT NULL,
	"token_name" varchar NOT NULL,
	"token_symbol" varchar NOT NULL,
	"token_address" varchar NOT NULL,
	"token_decimals" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analytics" ADD CONSTRAINT "analytics_id_pool_pool_id_pool_fk" FOREIGN KEY ("id_pool") REFERENCES "pool"("id_pool") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool" ADD CONSTRAINT "pool_id_token_0_token_id_token_fk" FOREIGN KEY ("id_token_0") REFERENCES "token"("id_token") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool" ADD CONSTRAINT "pool_id_token_1_token_id_token_fk" FOREIGN KEY ("id_token_1") REFERENCES "token"("id_token") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool" ADD CONSTRAINT "pool_id_dex_dex_id_dex_fk" FOREIGN KEY ("id_dex") REFERENCES "dex"("id_dex") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool" ADD CONSTRAINT "pool_id_blockchain_blockchain_id_blockchain_fk" FOREIGN KEY ("id_blockchain") REFERENCES "blockchain"("id_blockchain") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "price" ADD CONSTRAINT "price_id_token_token_id_token_fk" FOREIGN KEY ("id_token") REFERENCES "token"("id_token") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
