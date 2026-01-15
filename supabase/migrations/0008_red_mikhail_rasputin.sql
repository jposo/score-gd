CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ip_address" text NOT NULL,
	"successful" boolean NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_votes" (
	"user_id" integer NOT NULL,
	"progress_id" integer NOT NULL,
	"is_helpful" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "review_votes_user_id_progress_id_pk" PRIMARY KEY("user_id","progress_id")
);
--> statement-breakpoint
ALTER TABLE "progress" RENAME COLUMN "rating" TO "score";--> statement-breakpoint
ALTER TABLE "level_creators" DROP CONSTRAINT "level_creators_creator_id_gd_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_account_id_gd_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "hide_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "helpful_votes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "unhelpful_votes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "sources" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_shadow_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_ip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registration_ip" text;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_progress_id_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_day_index" ON "days" USING btree ("day");--> statement-breakpoint
CREATE INDEX "status_index" ON "progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "level_id_index" ON "progress" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "score_index" ON "progress" USING btree ("score");--> statement-breakpoint
CREATE INDEX "completed_at_index" ON "progress" USING btree ("completed_at");