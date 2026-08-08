-- Mission auto-tracking: add the event type that advances each mission.
ALTER TABLE "missions" ADD COLUMN "tracking_action" TEXT;

-- Backfill existing missions so nothing is stuck:
--   conversation/matching missions are advanced by video matches,
--   daily profile housekeeping by profile updates,
--   culture/support questions by asking a guardian.
UPDATE "missions"
SET "tracking_action" = CASE
  WHEN "title" IN ('First Flight', 'Warm-Up Sparring', 'Canopy Chatter') THEN 'VIDEO_MATCH_COMPLETED'
  WHEN "title" = 'Nest Check-In' THEN 'PROFILE_UPDATED'
  WHEN "title" = 'Cultural Explorer' THEN 'GUARDIAN_QUESTION_ASKED'
  WHEN "title" = 'Flight Chain' THEN 'VIDEO_MATCH_COMPLETED'
  ELSE 'VIDEO_MATCH_COMPLETED'
END;
