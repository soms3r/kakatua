-- Guardian AI bot: ticket answers + moderator flags

-- 1. Users: moderator role flag
ALTER TABLE "users"
  ADD COLUMN "is_moderator" BOOLEAN NOT NULL DEFAULT false;

-- 2. Guardian tickets: auto-bot answer fields
ALTER TABLE "guardian_tickets"
  ADD COLUMN "answer_text" TEXT,
  ADD COLUMN "answer_source" TEXT,
  ADD COLUMN "confidence" REAL,
  ADD COLUMN "answered_by_id" TEXT,
  ADD COLUMN "answered_at" TIMESTAMP(3);

CREATE INDEX "guardian_tickets_answered_by_id_idx" ON "guardian_tickets"("answered_by_id");

-- 3. Foreign key for moderator answers
ALTER TABLE "guardian_tickets"
  ADD CONSTRAINT "guardian_tickets_answered_by_id_fkey" FOREIGN KEY ("answered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
