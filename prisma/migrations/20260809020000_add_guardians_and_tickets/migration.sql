-- Guardian System: ambassador profile fields, support tickets, report moderation

-- 1. Users: ambassador badge, specialty languages, live presence
ALTER TABLE "users"
  ADD COLUMN "ambassador_badge" TEXT,
  ADD COLUMN "specialty_languages" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "is_online" BOOLEAN NOT NULL DEFAULT false;

-- 2. UserReports: moderation lifecycle
ALTER TABLE "user_reports"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "resolution" TEXT,
  ADD COLUMN "resolved_by_id" TEXT,
  ADD COLUMN "resolved_at" TIMESTAMP(3);

CREATE INDEX "user_reports_status_idx" ON "user_reports"("status");

-- 3. Guardian tickets (community support)
CREATE TABLE "guardian_tickets" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "guardian_id" TEXT,
  "type" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "resolved_at" TIMESTAMP(3),
  "resolution" TEXT,

  CONSTRAINT "guardian_tickets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guardian_tickets_user_id_idx" ON "guardian_tickets"("user_id");
CREATE INDEX "guardian_tickets_guardian_id_idx" ON "guardian_tickets"("guardian_id");
CREATE INDEX "guardian_tickets_status_idx" ON "guardian_tickets"("status");

-- 4. Foreign keys
ALTER TABLE "user_reports"
  ADD CONSTRAINT "user_reports_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "guardian_tickets"
  ADD CONSTRAINT "guardian_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guardian_tickets"
  ADD CONSTRAINT "guardian_tickets_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
