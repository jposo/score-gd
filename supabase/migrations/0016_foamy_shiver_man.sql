DROP TABLE "progress";
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"status" "status",
	"score" smallint,
	"completion_percentage" smallint,
	"completion_time" interval,
	"attempts" integer,
	"started_at" date,
	"completed_at" date,
	"video_url" text,
	"review" text,
	"hide_review" boolean DEFAULT false NOT NULL,
	"helpful_votes" integer DEFAULT 0 NOT NULL,
	"unhelpful_votes" integer DEFAULT 0 NOT NULL,
	"list_placement" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "score_check" CHECK ("progress"."score" >= 1 AND "progress"."score" <= 10),
	CONSTRAINT "percentage_check" CHECK ("progress"."completion_percentage" >= 0 AND "progress"."completion_percentage" <= 100)
);
--> statement-breakpoint
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DROP TABLE "days" CASCADE;
CREATE TABLE "days" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"image_paths" text[] DEFAULT '{}'::text[] NOT NULL,
	"level_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" uuid,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
--> statement-breakpoint
ALTER TABLE "days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

ALTER TABLE "level_creators" DROP CONSTRAINT "level_creators_level_id_levels_id_fk";

DROP TABLE "levels" CASCADE;
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"release_date" date,
	"video_url" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "levels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_progress_id_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_creators" ADD CONSTRAINT "level_creators_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
