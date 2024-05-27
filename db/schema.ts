import { relations } from 'drizzle-orm';
import { serial, varchar, integer, numeric, date, doublePrecision, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

export const blockchain = pgTable('blockchain', {
    id_blockchain: serial('id_blockchain').primaryKey(),
    blockchain_name: varchar('blockchain_name').notNull(),
    blockchain_type: varchar('blockchain_type').notNull(),
    chain_id: integer('chain_id').notNull(),
});

export const blockchainRelations = relations(blockchain, ({ many }) => ({
    pools: many(pool)
}))

export type Blockchain = typeof blockchain.$inferSelect;

export const token = pgTable('token', {
    id_token: serial('id_token').primaryKey(),
    token_name: varchar('token_name').notNull(),
    token_symbol: varchar('token_symbol').notNull(),
    token_address: varchar('token_address').notNull(),
    token_decimals: integer('token_decimals').notNull(),
    token_optional_image: varchar('token_optional_image'),
    chain_id: integer('chain_id').references(() => blockchain.id_blockchain),
});

export const tokenRelations = relations(token, ({ many, one }) => ({
    prices: many(price),
    blockchain: one(blockchain, { fields: [token.chain_id], references: [blockchain.id_blockchain] }),
}));

export type Token = typeof token.$inferSelect;

export const dex = pgTable('dex', {
    id_dex: serial('id_dex').primaryKey(),
    dex_name: varchar('dex_name').notNull(),
    dex_type: varchar('dex_type').notNull(),
});

export type Dex = typeof dex.$inferSelect;

export const pool = pgTable('pool', {
    id_pool: serial('id_pool').primaryKey(),
    pool_address: varchar('pool_address').notNull(),
    decimals: integer('decimals').notNull().default(18),
    pool_fee: numeric('pool_fee', { precision: 5, scale: 2 }),
    pool_creation_date: date('pool_creation_date'),
    id_token_0: integer('id_token_0').references(() => token.id_token),
    id_token_1: integer('id_token_1').references(() => token.id_token),
    id_dex: integer('id_dex').references(() => dex.id_dex),
    id_blockchain: integer('id_blockchain').references(() => blockchain.id_blockchain),
});

export const poolRelations = relations(pool, ({ one, many }) => ({
    token_0: one(token, { fields: [pool.id_token_0], references: [token.id_token] }),
    token_1: one(token, { fields: [pool.id_token_1], references: [token.id_token] }),
    dex: one(dex, { fields: [pool.id_dex], references: [dex.id_dex] }),
    blockchain: one(blockchain, { fields: [pool.id_blockchain], references: [blockchain.id_blockchain] }),
    analytics: many(analytics),
}))

export type Pool = typeof pool.$inferSelect;

export const analytics = pgTable('analytics', {
    id_analytics: serial('id_analytics').primaryKey(),
    id_pool: integer('id_pool').references(() => pool.id_pool),
    date: date('date', { mode: "date" }),
    quantity_token_0: doublePrecision('quantity_token_0'),
    quantity_token_1: doublePrecision('quantity_token_1'),
    quantity_token_lp: doublePrecision('quantity_token_lp'),
    volume_token_0: doublePrecision('volume_token_0'),
    volume_token_1: doublePrecision('volume_token_1'),
    mrm: doublePrecision('mrm'),
    volatility_score: doublePrecision('volatility_score'),
    lrm: doublePrecision('lrm'),
    liquidity_score: doublePrecision('liquidity_score'),
    lp_apy_1d: doublePrecision('lp_apy_1d'),
    lp_vs_hold_apy_1d: doublePrecision('lp_vs_hold_apy_1d'),
    fee_apy_1d: doublePrecision('fee_apy_1d'),
    il_apy_1d: doublePrecision('il_apy_1d'),
    hold_apy_1d: doublePrecision('hold_apy_1d'),
    lp_apy_1m: doublePrecision('lp_apy_1m'),
    lp_vs_hold_apy_1m: doublePrecision('lp_vs_hold_apy_1m'),
    fee_apy_1m: doublePrecision('fee_apy_1m'),
    il_apy_1m: doublePrecision('il_apy_1m'),
    hold_apy_1m: doublePrecision('hold_apy_1m'),
    lp_apy_3m: doublePrecision('lp_apy_3m'),
    lp_vs_hold_apy_3m: doublePrecision('lp_vs_hold_apy_3m'),
    fee_apy_3m: doublePrecision('fee_apy_3m'),
    il_apy_3m: doublePrecision('il_apy_3m'),
    hold_apy_3m: doublePrecision('hold_apy_3m'),
    lp_apy_1y: doublePrecision('lp_apy_1y'),
    lp_vs_hold_apy_1y: doublePrecision('lp_vs_hold_apy_1y'),
    fee_apy_1y: doublePrecision('fee_apy_1y'),
    il_apy_1y: doublePrecision('il_apy_1y'),
    hold_apy_1y: doublePrecision('hold_apy_1y'),
}, (table) => ({
    uniqueAnalyticsEntry: uniqueIndex("uniqueAnalyticsEntry").on(table.id_pool, table.date),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
    pool: one(pool, { fields: [analytics.id_pool], references: [pool.id_pool] }),
}));

export type Analytics = typeof analytics.$inferSelect;

export const price = pgTable('price', {
    id_price: serial('id_price').primaryKey(),
    id_token: integer('id_token').references(() => token.id_token),
    date: date('date', { mode: "date" }),
    price: doublePrecision('price'),
    price_currency: varchar('price_currency'),
}, (table) => ({
    uniquePriceEntry: uniqueIndex("uniquePriceEntry").on(table.id_token, table.date),
}));

export const priceRelations = relations(price, ({ one }) => ({
    token: one(token, { fields: [price.id_token], references: [token.id_token] }),
}));

export type Price = typeof price.$inferSelect;