// Shared constants (app/lib/constants.ts)
// Non-async values that must NOT live in 'use server' files.

/** Human-readable labels for mission tracking actions. */
export const TRACKING_ACTION_LABELS: Record<string, string> = {
  VIDEO_MATCH_COMPLETED: 'Complete a video match with a partner',
  PROFILE_UPDATED: 'Update your profile settings',
  GUARDIAN_QUESTION_ASKED: 'Ask a question to a guardian',
};
