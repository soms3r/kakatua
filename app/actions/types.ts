// Common Type definitions for Kakatua Server Actions (app/actions/types.ts)

export type ActionResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; error: string };

export interface DetailedContent {
  languageInfo: { primaryLanguage: string; majorDialects: string[]; keyPhrases: string[] };
  culturalRituals: { festivalName: string; description: string }[];
  culinaryNarrative: { dishName: string; historicalOrigin: string; culturalSignificance: string }[];
  historicalContext: string;
  socialEtiquette: string[];
}

export interface DiscoverAmbassador {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  ambassadorRole: string | null;
  countrySlug: string | null;
  cultureCardId: string | null;
  loveCount: number;
  isUserCreated: boolean;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
}

export interface CountryDetailData {
  id: string;
  name: string;
  countrySlug: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  cultureCardId: string | null;
  loveCount: number;
  cultureCard: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  } | null;
  detailedContent: DetailedContent | null;
}

export interface WizardFormData {
  primaryLanguage: string;
  keyPhrases: string[];
  traditionsSummary: string;
  rituals: { festivalName: string; description: string }[];
  foodSummary: string;
  dishes: { dishName: string; historicalOrigin: string; culturalSignificance: string }[];
  historySummary: string;
  funFact: string;
  socialEtiquette: string[];
}

export type FeedbackCategory = 'Bug' | 'Idea' | 'FeatureRequest' | 'Other';
export type FeedbackStatus = 'New' | 'Reviewing' | 'Resolved';

// ─── Profile Settings (normalized profile architecture) ───────────────────────

export interface ProfileSettingsProfile {
  username: string | null;
  displayName: string | null;
  profilePhoto: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  nativeLanguage: string | null;
  interfaceLanguage: string | null;
}

export interface UserLanguageEntry {
  languageId: string;
  proficiency: string | null;
}

export interface LanguageGoalEntry {
  goalType: string;
  languageId: string | null;
  targetLevel: string | null;
  targetDate: string | null;
  status: string;
}

export interface MatchPreferenceEntry {
  seeking: string | null;
  partnerGenderPreference: string | null;
  partnerAgeMin: number | null;
  partnerAgeMax: number | null;
  callPreference: string | null;
  conversationTopics: string[];
}

export interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string | null;
}

export interface PrivacySettingsEntry {
  showProfile: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
  showEmail: boolean;
  showAge: boolean;
  showLocation: boolean;
  allowDMs: boolean;
  allowVideoCalls: boolean;
}

export interface ProfileSettingsPayload {
  profile: ProfileSettingsProfile;
  nativeLanguages: UserLanguageEntry[];
  learningLanguages: UserLanguageEntry[];
  goals: LanguageGoalEntry[];
  matchPreference: MatchPreferenceEntry;
  interestIds: string[];
  availability: AvailabilityEntry[];
  privacySettings: PrivacySettingsEntry;
}

export interface LanguageOption {
  id: string;
  code: string;
  name: string;
  flagEmoji: string | null;
}

export interface InterestOption {
  id: string;
  name: string;
  category: string | null;
}

export interface ProfileSettingsSnapshot {
  payload: ProfileSettingsPayload;
  languages: LanguageOption[];
  interests: InterestOption[];
}
