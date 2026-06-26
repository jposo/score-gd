ALTER TABLE "progress" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "integer" smallint;