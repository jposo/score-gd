ALTER TABLE "users" DROP COLUMN "profile_picture_key";
CREATE UNIQUE INDEX "user_level_index" ON "progress" USING btree ("user_id","level_id");
