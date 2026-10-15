export type LanguageCode =
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'ar'
  | 'pt'
  | 'zh-CN'
  | 'th'
  | 'hi'
  | 'ja'
  | 'ko';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇵🇹' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr', flag: '🇹🇭' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷' },
];

export const CEFR_LEVELS: { level: CEFRLevel; title: string; desc: string }[] = [
  { level: 'A1', title: 'Beginner', desc: 'Basic phrases and everyday expressions' },
  { level: 'A2', title: 'Elementary', desc: 'Routine tasks and simple personal information' },
  { level: 'B1', title: 'Intermediate', desc: 'Familiar matters, travel, and personal interests' },
  { level: 'B2', title: 'Upper Intermediate', desc: 'Complex texts, technical discussions, and fluent conversation' },
  { level: 'C1', title: 'Advanced', desc: 'Flexible language use for social, academic, and professional goals' },
  { level: 'C2', title: 'Proficient', desc: 'Effortless understanding, nuance, and native-level precision' },
];

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  interfaceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  preferredTranslationLanguage: LanguageCode;
  currentLevel: CEFRLevel;
  dailyGoalCards: number;
  theme: 'light' | 'dark' | 'system';
  timeZone: string;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
}

export type SRSState = 'new' | 'learning' | 'review' | 'relearning';

export interface SRSCardState {
  state: SRSState;
  interval: number; // in days
  easeFactor: number; // default 2.5
  repetitions: number;
  lapses: number;
  lastReviewedAt?: string;
  nextDueAt: string;
}

export interface Card {
  id: string;
  deckId: string;
  ownerId: string;
  term: string;
  translation: string;
  translations?: Partial<Record<LanguageCode, string>>;
  pronunciation?: string;
  transliteration?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  exampleTranslations?: Partial<Record<LanguageCode, string>>;
  usageNote?: string;
  tags: string[];
  srsState: SRSCardState;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  targetLanguage: LanguageCode;
  categoryId: string;
  level: CEFRLevel;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  sourceType?: 'custom' | 'explore' | 'imported';
  sourceDeckId?: string;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface StudyEvent {
  id: string;
  userId: string;
  deckId: string;
  cardId: string;
  rating: ReviewRating;
  reviewTimestamp: string;
  interval: number;
  easeFactor: number;
  durationMs: number;
}

export interface StudyStats {
  totalReviews: number;
  uniqueCardsReviewed: number;
  cardsLearned: number;
  dueCardsCount: number;
  currentStreak: number;
  bestStreak: number;
  todayReviewsCount: number;
  dailyGoalProgress: number;
  historyByDate: Record<string, number>;
}

export interface CategoryInfo {
  id: string;
  iconName: string;
  gradient?: string;
  accentColor?: string;
  imageSvg?: string;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export interface ContentManifestEntry {
  targetLanguage: LanguageCode;
  categoryId: string;
  level: CEFRLevel;
  expectedCardCount: number;
  actualValidCardCount: number;
  uniqueCardCount: number;
  missingTranslationsCount: number;
  missingExampleTranslationsCount: number;
  invalidRecordsCount: number;
  validationStatus: 'complete' | 'in_progress' | 'planned';
  contentVersion: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
