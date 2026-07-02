CREATE TYPE "public"."difficulty" AS ENUM('n/a', 'auto', 'easy', 'normal', 'hard', 'harder', 'insane', 'demon', 'easy demon', 'medium demon', 'hard demon', 'insane demon', 'extreme demon');--> statement-breakpoint
CREATE TYPE "public"."length" AS ENUM('tiny', 'short', 'medium', 'long', 'xl', 'platformer');--> statement-breakpoint
CREATE TYPE "public"."rating" AS ENUM('no star', 'star', 'featured', 'epic', 'legendary', 'mythic');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('to try', 'in progress', 'completed', 'dropped');--> statement-breakpoint
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
CREATE TABLE "level_creators" (
	"level_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	CONSTRAINT "level_creators_level_id_creator_id_pk" PRIMARY KEY("level_id","creator_id")
);
--> statement-breakpoint
ALTER TABLE "level_creators" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
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
	"list_placement" numeric(40, 20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "score_check" CHECK ("progress"."score" >= 1 AND "progress"."score" <= 10),
	CONSTRAINT "percentage_check" CHECK ("progress"."completion_percentage" >= 0 AND "progress"."completion_percentage" <= 100)
);
--> statement-breakpoint
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "progress_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"progress_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"old_status" "status",
	"new_status" "status",
	"old_list_placement" numeric(40, 20),
	"new_list_placement" numeric(40, 20),
	"change_type" text NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_to" timestamp,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "review_votes" (
	"user_id" uuid NOT NULL,
	"progress_id" integer NOT NULL,
	"is_helpful" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "review_votes_user_id_progress_id_pk" PRIMARY KEY("user_id","progress_id")
);
--> statement-breakpoint
ALTER TABLE "review_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "sources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" integer,
	"username" text,
	"email" text NOT NULL,
	"bio" text,
	"roles" "role"[],
	"is_active" boolean DEFAULT true NOT NULL,
	"is_shadow_banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_creators" ADD CONSTRAINT "level_creators_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_progress_id_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_progress_id_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_day_index" ON "days" USING btree ("day");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_level_index" ON "progress" USING btree ("user_id","level_id");--> statement-breakpoint
CREATE INDEX "progress_level_status_index" ON "progress" USING btree ("level_id","status");--> statement-breakpoint
CREATE INDEX "progress_user_activity_index" ON "progress" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "progress_level_id_index" ON "progress" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "progress_active_list_order_index" ON "progress" USING btree ("user_id","status","list_placement");--> statement-breakpoint
CREATE INDEX "progress_history_user_changed_at_index" ON "progress_history" USING btree ("user_id","changed_at");--> statement-breakpoint
CREATE INDEX "progress_history_progress_id_index" ON "progress_history" USING btree ("progress_id");
