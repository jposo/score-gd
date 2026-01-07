ALTER TABLE "days" RENAME COLUMN "images" TO "image_paths";--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "gd_users" ADD COLUMN "last_synced_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "updated_at" timestamp DEFAULT now();