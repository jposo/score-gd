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
DROP INDEX "user_level_index";--> statement-breakpoint
DROP INDEX "status_index";--> statement-breakpoint
DROP INDEX "level_id_index";--> statement-breakpoint
DROP INDEX "score_index";--> statement-breakpoint
DROP INDEX "completed_at_index";--> statement-breakpoint
ALTER TABLE "progress" ALTER COLUMN "list_placement" SET DATA TYPE numeric(40, 20);--> statement-breakpoint
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_progress_id_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "progress_history_user_changed_at_index" ON "progress_history" USING btree ("user_id","changed_at");--> statement-breakpoint
CREATE INDEX "progress_history_progress_id_index" ON "progress_history" USING btree ("progress_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_level_index" ON "progress" USING btree ("user_id","level_id");--> statement-breakpoint
CREATE INDEX "progress_level_status_index" ON "progress" USING btree ("level_id","status");--> statement-breakpoint
CREATE INDEX "progress_user_activity_index" ON "progress" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "progress_level_id_index" ON "progress" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "progress_active_list_order_index" ON "progress" USING btree ("user_id","status","list_placement");

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.enforce_active_completed_limit()
RETURNS trigger AS $$
DECLARE
  active_count integer;
BEGIN
  IF NEW.status = 'completed' AND NEW.list_placement IS NOT NULL THEN
    SELECT COUNT(*)
      INTO active_count
    FROM public.progress
    WHERE user_id = NEW.user_id
      AND status = 'completed'
      AND list_placement IS NOT NULL
      AND id <> COALESCE(NEW.id, -1);

    IF active_count >= 25 THEN
      RAISE EXCEPTION 'active completed list cannot exceed 25 items';
    END IF;
  END IF;

  IF NEW.status IS DISTINCT FROM 'completed' AND NEW.list_placement IS NOT NULL THEN
    RAISE EXCEPTION 'only completed progress can have an active list placement';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
DROP TRIGGER IF EXISTS enforce_active_completed_limit_trigger ON public.progress;

--> statement-breakpoint
CREATE TRIGGER enforce_active_completed_limit_trigger
BEFORE INSERT OR UPDATE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION public.enforce_active_completed_limit();

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.capture_progress_history()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status
      OR OLD.list_placement IS DISTINCT FROM NEW.list_placement THEN
      INSERT INTO public.progress_history (
        progress_id,
        user_id,
        level_id,
        old_status,
        new_status,
        old_list_placement,
        new_list_placement,
        change_type,
        valid_from,
        valid_to,
        changed_at
      ) VALUES (
        OLD.id,
        OLD.user_id,
        OLD.level_id,
        OLD.status,
        NEW.status,
        OLD.list_placement,
        NEW.list_placement,
        'update',
        COALESCE(OLD.updated_at, OLD.created_at, now()),
        now(),
        now()
      );
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.progress_history (
      progress_id,
      user_id,
      level_id,
      old_status,
      new_status,
      old_list_placement,
      new_list_placement,
      change_type,
      valid_from,
      valid_to,
      changed_at
    ) VALUES (
      OLD.id,
      OLD.user_id,
      OLD.level_id,
      OLD.status,
      NULL,
      OLD.list_placement,
      NULL,
      'delete',
      COALESCE(OLD.updated_at, OLD.created_at, now()),
      now(),
      now()
    );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
DROP TRIGGER IF EXISTS capture_progress_history_trigger ON public.progress;

--> statement-breakpoint
CREATE TRIGGER capture_progress_history_trigger
AFTER UPDATE OR DELETE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION public.capture_progress_history();
