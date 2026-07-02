create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (
    new.id,
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
