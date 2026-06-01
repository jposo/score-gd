DROP TABLE "users" CASCADE;
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	"account_id" integer,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"bio" text,
	"profile_picture_key" text,
	"roles" "role"[],
	"is_active" boolean DEFAULT true NOT NULL,
	"is_shadow_banned" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;


DROP TABLE "login_attempts" CASCADE;--> statement-breakpoint
