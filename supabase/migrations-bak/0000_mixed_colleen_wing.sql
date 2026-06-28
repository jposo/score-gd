CREATE TYPE "public"."difficulty" AS ENUM('n/a', 'auto', 'easy', 'normal', 'hard', 'harder', 'insane', 'demon', 'easy demon', 'medium demon', 'hard demon', 'insane demon', 'extreme demon');--> statement-breakpoint
CREATE TYPE "public"."length" AS ENUM('tiny', 'short', 'medium', 'long', 'xl', 'platformer');--> statement-breakpoint
CREATE TYPE "public"."rating" AS ENUM('no star', 'star', 'featured', 'epic', 'legendary', 'mythic');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('to try', 'in progress', 'completed', 'dropped');--> statement-breakpoint
CREATE TABLE "days" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"images" jsonb NOT NULL,
	"level_id" integer NOT NULL,
	"source_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gd_users" (
	"id" integer PRIMARY KEY NOT NULL,
	"account_id" integer,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "level_creators" (
	"level_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	CONSTRAINT "level_creators_level_id_creator_id_pk" PRIMARY KEY("level_id","creator_id")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"publisher_id" integer NOT NULL,
	"description" text,
	"difficulty" "difficulty" NOT NULL,
	"length" "length" NOT NULL,
	"song_id" integer NOT NULL,
	"release_date" date,
	"game_version" integer NOT NULL,
	"video_url" text,
	"coins" smallint NOT NULL,
	"is_two_player" boolean NOT NULL,
	"rating" "rating" NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_synced_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"level_id" integer NOT NULL,
	"status" "status" NOT NULL,
	"completion_percentage" smallint,
	"completion_time" interval,
	"attempts" integer,
	"started_at" date,
	"completed_at" date,
	"video_url" text,
	"review" text,
	"list_placement" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"url" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"bio" text,
	"profile_picture_key" text,
	"roles" "role"[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_creators" ADD CONSTRAINT "level_creators_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_creators" ADD CONSTRAINT "level_creators_creator_id_gd_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."gd_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_publisher_id_gd_users_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."gd_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_gd_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."gd_users"("id") ON DELETE no action ON UPDATE no action;