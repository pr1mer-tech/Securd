ALTER TABLE "analytics" ALTER COLUMN "quantity_token_0" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "analytics" ALTER COLUMN "quantity_token_1" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "analytics" ALTER COLUMN "quantity_token_lp" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "analytics" ALTER COLUMN "volume_token_0" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "analytics" ALTER COLUMN "volume_token_1" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "token" ADD COLUMN "chain_id" integer DEFAULT 1 NOT NULL;