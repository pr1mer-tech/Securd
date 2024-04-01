-- -------------------------------------------------------------
-- Securd
--
-- Database: analytics
-- -------------------------------------------------------------

-- Table Definition
CREATE TABLE "public"."blockchain" (
    "id_blockchain" SERIAL PRIMARY KEY,
    "blockchain_name" VARCHAR NOT NULL,
    "blockchain_type" VARCHAR NOT NULL, -- e.g., EVM, UTXO, etc.
    "chain_id" INTEGER NOT NULL -- unique identifier for the blockchain, see https://chainlist.org
);

-- Table Definition
CREATE TABLE "public"."token" (
    "id_token" SERIAL PRIMARY KEY,
    "token_name" VARCHAR NOT NULL, -- name of the token (e.g., Ethereum, Bitcoin, etc.)
    "token_symbol" VARCHAR NOT NULL, -- symbol of the token (e.g., ETH, BTC, etc.)
    "token_address" VARCHAR NOT NULL, -- contract address of the token
    "token_decimals" INTEGER NOT NULL -- number of decimal places for the token
    -- Potential additional fields: token_logo, token_description, token_website, etc. Otherwise, we can use https://github.com/trustwallet/assets for user facing data
);

-- Table Definition
CREATE TABLE "public"."dex" (
    "id_dex" SERIAL PRIMARY KEY,
    "dex_name" VARCHAR NOT NULL,
    "dex_type" VARCHAR NOT NULL -- e.g., AMM, Order Book, etc.
);

-- Table Definition
CREATE TABLE "public"."pool" (
    "id_pool" SERIAL PRIMARY KEY,
    "pool_address" VARCHAR NOT NULL, -- unique address of the pool
    "pool_fee" NUMERIC(5, 2), -- pool fee percentage
    "pool_creation_date" DATE,
    "id_token_0" INTEGER REFERENCES "token"("id_token"),
    "id_token_1" INTEGER REFERENCES "token"("id_token"),
    "id_dex" INTEGER REFERENCES "dex"("id_dex"),
    "id_blockchain" INTEGER REFERENCES "blockchain"("id_blockchain")
);

-- Table Definition
CREATE TABLE "public"."analytics" (
    "id_analytics" SERIAL PRIMARY KEY,
    "id_pool" INTEGER REFERENCES "pool"("id_pool"),
    "date" DATE, -- date of the analytics data
    "quantity_token_0" NUMERIC(78, 0), -- quantity of token 0 in the pool, considering token decimals
    "quantity_token_1" NUMERIC(78, 0), -- quantity of token 1 in the pool, considering token decimals
    "quantity_token_lp" NUMERIC(78, 0), -- quantity of LP tokens in the pool, considering token decimals
    "volume_token_0" NUMERIC(78, 0), -- trading volume of token 0, considering token decimals
    "volume_token_1" NUMERIC(78, 0), -- trading volume of token 1, considering token decimals
    "mrm" DOUBLE PRECISION, -- market risk metric
    "volatility_score" DOUBLE PRECISION, -- volatility score of the pool
    "lrm" DOUBLE PRECISION, -- liquidity risk metric
    "liquidity_score" DOUBLE PRECISION, -- liquidity score of the pool
    "lp_apy_1d" DOUBLE PRECISION, -- LP APY for 1 day
    "lp_vs_hold_apy_1d" DOUBLE PRECISION, -- LP APY vs. Hold APY for 1 day
    "fee_apy_1d" DOUBLE PRECISION, -- Fee APY for 1 day
    "il_apy_1d" DOUBLE PRECISION, -- Impermanent Loss APY for 1 day
    "hold_apy_1d" DOUBLE PRECISION, -- Hold APY for 1 day
    "lp_apy_1m" DOUBLE PRECISION, -- LP APY for 1 month
    "lp_vs_hold_apy_1m" DOUBLE PRECISION, -- LP APY vs. Hold APY for 1 month
    "fee_apy_1m" DOUBLE PRECISION, -- Fee APY for 1 month
    "il_apy_1m" DOUBLE PRECISION, -- Impermanent Loss APY for 1 month
    "hold_apy_1m" DOUBLE PRECISION, -- Hold APY for 1 month
    "lp_apy_3m" DOUBLE PRECISION, -- LP APY for 3 months
    "lp_vs_hold_apy_3m" DOUBLE PRECISION, -- LP APY vs. Hold APY for 3 months
    "fee_apy_3m" DOUBLE PRECISION, -- Fee APY for 3 months
    "il_apy_3m" DOUBLE PRECISION, -- Impermanent Loss APY for 3 months
    "hold_apy_3m" DOUBLE PRECISION, -- Hold APY for 3 months
    "lp_apy_1y" DOUBLE PRECISION, -- LP APY for 1 year
    "lp_vs_hold_apy_1y" DOUBLE PRECISION, -- LP APY vs. Hold APY for 1 year
    "fee_apy_1y" DOUBLE PRECISION, -- Fee APY for 1 year
    "il_apy_1y" DOUBLE PRECISION, -- Impermanent Loss APY for 1 year
    "hold_apy_1y" DOUBLE PRECISION -- Hold APY for 1 year
);

-- Table Definition
CREATE TABLE "public"."price" (
    "id_price" SERIAL PRIMARY KEY,
    "id_token" INTEGER REFERENCES "token"("id_token"),
    "date" DATE, -- date of the price data
    "price" DOUBLE PRECISION, -- price of the token, considering token decimals
    "price_currency" VARCHAR -- currency in which the price is denominated (e.g., USD, ETH)
);