-- Missions normalization: convert master `missions` + join `user_missions`
-- into a single per-user, normalized `missions` model.

-- 1. Extend the existing table with the normalized columns
ALTER TABLE "missions"
  ADD COLUMN "user_id" TEXT,
  ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "target" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "reward_claimed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "is_prebuilt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'CUSTOM',
  ADD COLUMN "completed_at" TIMESTAMP(3);

-- 2. Migrate legacy progress rows (one per user) into the missions table
INSERT INTO "missions" (
  "id", "user_id", "title", "description", "exp_reward", "category",
  "progress", "target", "status", "reward_claimed", "is_prebuilt",
  "source", "completed_at", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(),
  "um"."user_id",
  "m"."title",
  "m"."description",
  "m"."exp_reward",
  CASE WHEN "m"."type" = 'daily' THEN 'DAILY' ELSE 'GOAL' END,
  "um"."progress",
  100,
  CASE WHEN "um"."completed" THEN 'COMPLETED' ELSE 'PENDING' END,
  false,
  true,
  'PREBUILT',
  "um"."completed_at",
  "m"."created_at",
  "m"."updated_at"
FROM "missions" "m"
INNER JOIN "user_missions" "um" ON "um"."mission_id" = "m"."id";

-- 3. Drop the original master rows (now duplicated per user) and legacy columns
DELETE FROM "missions" WHERE "user_id" IS NULL;

ALTER TABLE "missions" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "missions" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "missions" DROP COLUMN "type";

-- 4. Link the table to users
CREATE INDEX "missions_user_id_idx" ON "missions"("user_id");
ALTER TABLE "missions" ADD CONSTRAINT "missions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Remove the obsolete join table
DROP TABLE "user_missions";
