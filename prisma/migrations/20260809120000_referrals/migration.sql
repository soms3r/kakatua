-- Referral system: invite codes on users, click log, and signup linking.
ALTER TABLE "users" ADD COLUMN "referral_code" TEXT;
ALTER TABLE "users" ADD COLUMN "invited_by_id" TEXT;

CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

ALTER TABLE "users"
  ADD CONSTRAINT "users_invited_by_id_fkey"
  FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "referral_clicks" (
  "id" TEXT NOT NULL,
  "referral_code" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "referral_clicks_referral_code_created_at_idx" ON "referral_clicks"("referral_code", "created_at");

CREATE TABLE "referral_signups" (
  "id" TEXT NOT NULL,
  "referral_code" TEXT NOT NULL,
  "new_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_signups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "referral_signups_referral_code_idx" ON "referral_signups"("referral_code");
CREATE INDEX "referral_signups_new_user_id_idx" ON "referral_signups"("new_user_id");

ALTER TABLE "referral_signups"
  ADD CONSTRAINT "referral_signups_new_user_id_fkey"
  FOREIGN KEY ("new_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: mint a referral code for every existing nest based on their name.
-- Collisions are avoided with a short per-row suffix (base36 of a row id slice).
DO $$
DECLARE
  row RECORD;
  base TEXT;
  candidate TEXT;
  existing_count INTEGER;
BEGIN
  FOR row IN SELECT "id", "name" FROM "users" WHERE "referral_code" IS NULL LOOP
    base := lower(regexp_replace(row."name", '[^a-zA-Z0-9]', '', 'g'));
    base := substring(base, 1, 20);
    IF base = '' THEN base := 'kakatua'; END IF;
    candidate := base;
    SELECT COUNT(*) INTO existing_count FROM "users" WHERE "referral_code" = candidate;
    IF existing_count > 0 THEN
      candidate := base || '_' || substr(md5(row."id"), 1, 4);
    END IF;
    UPDATE "users" SET "referral_code" = candidate WHERE "id" = row."id";
  END LOOP;
END $$;
