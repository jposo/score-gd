ALTER TABLE "gd_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "songs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "gd_users" CASCADE;--> statement-breakpoint
DROP TABLE "songs" CASCADE;--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT IF EXISTS "levels_publisher_id_gd_users_id_fk";
--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT IF EXISTS "levels_song_id_songs_id_fk";
--> statement-breakpoint
ALTER TABLE "levels" ALTER COLUMN "publisher_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "levels" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "difficulty";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "length";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "song_id";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "game_version";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "coins";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "is_two_player";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "levels" DROP COLUMN "last_synced_at";
