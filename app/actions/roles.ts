export const AMBASSADOR_ROLES = {
  GUIDE: 'GUIDE',
  MATCHMAKER: 'MATCHMAKER',
  CULTURAL_ADVISOR: 'CULTURAL_ADVISOR',
} as const;

export type AmbassadorRole = typeof AMBASSADOR_ROLES[keyof typeof AMBASSADOR_ROLES];

export const AMBASSADOR_EMAILS: Record<AmbassadorRole, string> = {
  GUIDE: 'guide@kakatua.app',
  MATCHMAKER: 'buddy@kakatua.app',
  CULTURAL_ADVISOR: 'dhaka@kakatua.app',
};
