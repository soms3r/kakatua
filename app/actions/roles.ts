export const AMBASSADOR_ROLES = {
  GUIDE: 'GUIDE',
  MATCHMAKER: 'MATCHMAKER',
  CULTURAL_ADVISOR: 'CULTURAL_ADVISOR',
} as const;

export type AmbassadorRole = typeof AMBASSADOR_ROLES[keyof typeof AMBASSADOR_ROLES];

export const AMBASSADOR_EMAILS: Record<AmbassadorRole, string> = {
  GUIDE: 'guide@kakatua.app',
  MATCHMAKER: 'buddy@kakatua.app',
  CULTURAL_ADVISOR: 'bangladesh@kakatua.app',
};

// The two global guardians of the flock (everything else stays out of the roster).
export const GLOBAL_GUARDIAN_ROLES: string[] = ['GUIDE', 'MATCHMAKER'];

export const GLOBAL_GUARDIANS = [
  {
    role: 'GUIDE' as const,
    email: 'guide@kakatua.app',
    name: 'Kakatua Guide',
    badge: 'Platform Expert',
    description:
      'Knowledgeable platform expert for app navigation, missions, settings help, and technical support.',
  },
  {
    role: 'MATCHMAKER' as const,
    email: 'buddy@kakatua.app',
    name: 'Global Buddy',
    badge: 'Casual Peer',
    description:
      'Friendly, casual peer for conversation practice, cultural exchange, and casual questions.',
  },
];
