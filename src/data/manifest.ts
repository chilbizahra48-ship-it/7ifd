import { CEFRLevel, ContentManifestEntry, LanguageCode, SUPPORTED_LANGUAGES } from '../types';
import { SUBJECT_CATEGORIES } from './categories';
import { BUNDLED_DECKS, BundledDeck, BundledCard } from './contentPacks';

export interface ValidationDetail {
  entry: ContentManifestEntry;
  deckRef?: BundledDeck;
  issues: string[];
}

/**
 * Validates a single card for completeness and consistency across all 11 languages
 */
export function validateCard(card: BundledCard, targetLanguage: LanguageCode): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const requiredLanguages = SUPPORTED_LANGUAGES.map((l) => l.code);

  if (!card.id || card.id.trim().length === 0) {
    issues.push('Missing card ID');
  }

  if (!card.term || card.term.trim().length === 0) {
    issues.push('Missing target term');
  }

  // Verify all 11 translations exist and are non-empty
  requiredLanguages.forEach((lang) => {
    if (!card.translations || !card.translations[lang] || card.translations[lang].trim().length === 0) {
      issues.push(`Missing term translation for ${lang}`);
    }
  });

  if (!card.exampleSentence || card.exampleSentence.trim().length === 0) {
    issues.push('Missing example sentence');
  }

  // Verify all 11 example translations exist
  requiredLanguages.forEach((lang) => {
    if (
      !card.exampleTranslations ||
      !card.exampleTranslations[lang] ||
      card.exampleTranslations[lang].trim().length === 0
    ) {
      issues.push(`Missing example translation for ${lang}`);
    }
  });

  return { isValid: issues.length === 0, issues };
}

/**
 * Programmatically builds the manifest across all 11 languages x 12 subjects x 6 CEFR levels
 */
export function buildCatalogueManifest(): ContentManifestEntry[] {
  const manifest: ContentManifestEntry[] = [];
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  SUPPORTED_LANGUAGES.forEach((lang) => {
    SUBJECT_CATEGORIES.forEach((cat) => {
      levels.forEach((lvl) => {
        // Look up corresponding bundled deck if present
        const bundled = BUNDLED_DECKS.find(
          (d) => d.targetLanguage === lang.code && d.categoryId === cat.id && d.level === lvl
        );

        if (!bundled || bundled.cards.length === 0) {
          manifest.push({
            targetLanguage: lang.code,
            categoryId: cat.id,
            level: lvl,
            expectedCardCount: 50,
            actualValidCardCount: 0,
            uniqueCardCount: 0,
            missingTranslationsCount: 0,
            missingExampleTranslationsCount: 0,
            invalidRecordsCount: 0,
            validationStatus: 'planned',
            contentVersion: 0,
          });
          return;
        }

        // Validate cards
        const seenTerms = new Set<string>();
        let validCardsCount = 0;
        let missingTranslationsTotal = 0;
        let missingExampleTranslationsTotal = 0;
        let invalidCount = 0;

        bundled.cards.forEach((c) => {
          const normTerm = c.term.trim().toLowerCase().normalize('NFC');
          if (seenTerms.has(normTerm)) {
            invalidCount++;
          } else {
            seenTerms.add(normTerm);
          }

          const v = validateCard(c, lang.code);
          if (v.isValid) {
            validCardsCount++;
          } else {
            invalidCount++;
            v.issues.forEach((issue) => {
              if (issue.includes('Missing term translation')) missingTranslationsTotal++;
              if (issue.includes('Missing example translation')) missingExampleTranslationsTotal++;
            });
          }
        });

        // Strict completeness criterion: exactly 50 cards, 50 unique, zero missing translations, zero invalid
        const isComplete =
          validCardsCount === 50 &&
          seenTerms.size === 50 &&
          missingTranslationsTotal === 0 &&
          missingExampleTranslationsTotal === 0 &&
          invalidCount === 0;

        manifest.push({
          targetLanguage: lang.code,
          categoryId: cat.id,
          level: lvl,
          expectedCardCount: 50,
          actualValidCardCount: validCardsCount,
          uniqueCardCount: seenTerms.size,
          missingTranslationsCount: missingTranslationsTotal,
          missingExampleTranslationsCount: missingExampleTranslationsTotal,
          invalidRecordsCount: invalidCount,
          validationStatus: isComplete ? 'complete' : validCardsCount > 0 ? 'in_progress' : 'planned',
          contentVersion: bundled.version,
        });
      });
    });
  });

  return manifest;
}

export const CATALOGUE_MANIFEST = buildCatalogueManifest();

export function getManifestSummary() {
  const totalSlots = CATALOGUE_MANIFEST.length; // 11 * 12 * 6 = 792
  const completedDecks = CATALOGUE_MANIFEST.filter((m) => m.validationStatus === 'complete').length;
  const inProgressDecks = CATALOGUE_MANIFEST.filter((m) => m.validationStatus === 'in_progress').length;
  const plannedDecks = CATALOGUE_MANIFEST.filter((m) => m.validationStatus === 'planned').length;
  const totalValidCards = CATALOGUE_MANIFEST.reduce((acc, m) => acc + m.actualValidCardCount, 0);

  return {
    totalSlots,
    completedDecks,
    inProgressDecks,
    plannedDecks,
    totalValidCards,
  };
}
