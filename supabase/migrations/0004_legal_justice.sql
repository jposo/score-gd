-- Custom SQL migration file, put your code below! --
ALTER TABLE "days"
ALTER COLUMN "image_paths"
SET DATA TYPE text[]
USING ARRAY[]::text[];

ALTER TABLE "days"
ALTER COLUMN "image_paths"
SET DEFAULT '{}'::text[];
