ALTER TABLE "token" ALTER COLUMN "chain_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "token" ALTER COLUMN "chain_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "token" ADD COLUMN "token_optional_image" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token" ADD CONSTRAINT "token_chain_id_blockchain_id_blockchain_fk" FOREIGN KEY ("chain_id") REFERENCES "blockchain"("id_blockchain") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
