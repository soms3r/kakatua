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
