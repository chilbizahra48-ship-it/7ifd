import { GoogleGenAI } from '@google/genai';
import { CEFRLevel, LanguageCode } from '../../types';
import { DOMAIN_DATA_MAP, CORE_LANGUAGE_PACK, MultilingualVocabItem } from '../../data/domainCardsProvider';

/**
 * =======================================================================
 * 7ifd AI Architecture (Modular, Offline-First & Future-Ready)
 * =======================================================================
 * 
 * CURRENT CONFIGURATION:
 * - Offline-First Mode: ACTIVE (100% Independent)
 * - Mandatory GEMINI_API_KEY: DISABLED
 * - Cloud AI Billing / Paid Model: DISABLED
 * 
 * The platform operates fully using pre-stored, curated linguistic data
 * across all 8 CEFR domains and 11 languages.
 * 
 * HOW TO RE-ENABLE AI IN THE FUTURE:
 * 1. Change `ENABLE_AI_FEATURES = true` below (or set `VITE_ENABLE_AI="true"` in .env).
 * 2. Provide a Gemini API key in `VITE_GEMINI_API_KEY` or `GEMINI_API_KEY`.
 * 3. The functions below will automatically route requests to Gemini 2.5 Flash.
 */
export const ENABLE_AI_FEATURES: boolean =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_AI === 'true'
    ? true
    : false;

export interface GeneratedCard {
  term: string;
  translation: string;
  pronunciation?: string;
  transliteration?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  usageNote?: string;
  tags: string[];
}

export interface AIStatus {
  enabled: boolean;
  provider: 'offline-bundled' | 'gemini';
  message: string;
}

/**
 * Returns the current status of AI services in 7ifd.
 */
export function getAIStatus(): AIStatus {
  if (ENABLE_AI_FEATURES) {
    const key = getApiKey();
    if (key) {
      return {
        enabled: true,
        provider: 'gemini',
        message: 'Google Gemini AI is active and configured.',
      };
    }
  }

  return {
    enabled: false,
    provider: 'offline-bundled',
    message: 'Offline-First Mode active. Using pre-bundled datasets with zero cloud/API costs.',
  };
}

/**
 * Safely resolves the API key from environment variables without throwing.
 */
function getApiKey(): string | null {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
      if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    }
  } catch {
    // Ignore environment access errors in restricted sandbox
  }
  return null;
}

/**
 * Suggests translations, examples, and pronunciation for a given word.
 * ALWAYS prioritizes local curated dictionaries for instant, zero-cost, offline results.
 */
export async function suggestCardDetails(
  term: string,
  targetLang: LanguageCode,
  nativeLang: LanguageCode
): Promise<GeneratedCard> {
  const normalized = term.trim().toLowerCase();

  // 1. Search all local offline datasets
  const allDatasets: MultilingualVocabItem[] = [
    ...Object.values(DOMAIN_DATA_MAP).flat(),
    ...CORE_LANGUAGE_PACK,
  ];

  const matched = allDatasets.find((item) => {
    const targetWord = item.terms[targetLang]?.toLowerCase();
    const englishWord = item.terms.en?.toLowerCase();
    return targetWord === normalized || englishWord === normalized || item.key.toLowerCase() === normalized;
  });

  if (matched) {
    return {
      term: matched.terms[targetLang] || term,
      translation: matched.terms[nativeLang] || matched.terms.en || '',
      pronunciation: matched.pronunciations?.[targetLang] || '',
      transliteration: matched.transliterations?.[targetLang] || '',
      exampleSentence: matched.examples[targetLang] || '',
      exampleTranslation: matched.examples[nativeLang] || matched.examples.en || '',
      usageNote: `Offline verified vocabulary (${matched.tags.join(', ')})`,
      tags: matched.tags,
    };
  }

  // 2. If AI is explicitly enabled and API key is present, optionally query Gemini
  if (ENABLE_AI_FEATURES) {
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Provide flashcard details for the word "${term}" in ${targetLang} with translations into ${nativeLang}.
Return JSON only:
{
  "term": "${term}",
  "translation": "meaning in ${nativeLang}",
  "pronunciation": "IPA or phonetic guide",
  "transliteration": "latin transliteration if non-latin script",
  "exampleSentence": "natural example sentence in ${targetLang}",
  "exampleTranslation": "translation of example sentence in ${nativeLang}",
  "usageNote": "grammar or register note",
  "tags": ["vocabulary"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          return JSON.parse(response.text) as GeneratedCard;
        }
      } catch (err) {
        console.warn('AI lookup fallback to offline defaults:', err);
      }
    }
  }

  // 3. Fallback when term is custom and not in offline dictionary
  return {
    term,
    translation: '',
    pronunciation: '',
    transliteration: '',
    exampleSentence: '',
    exampleTranslation: '',
    usageNote: 'Custom card',
    tags: ['custom'],
  };
}

/**
 * Generates or extracts a batch of cards for a given topic or domain.
 * In Offline Mode (default), it returns pre-stored high quality cards from the local domain packs.
 */
export async function generateVocabularyCards(params: {
  topic: string;
  targetLang: LanguageCode;
  nativeLang: LanguageCode;
  level?: CEFRLevel;
  count?: number;
}): Promise<GeneratedCard[]> {
  const { topic, targetLang, nativeLang, count = 10 } = params;

  // Always use offline domain packs when AI is disabled
  if (!ENABLE_AI_FEATURES) {
    // Find matching domain pack or fallback to core
    const domainKey = Object.keys(DOMAIN_DATA_MAP).find((k) =>
      k.toLowerCase().includes(topic.toLowerCase())
    ) || 'everyday-essentials';

    const sourcePool = DOMAIN_DATA_MAP[domainKey] || CORE_LANGUAGE_PACK;
    const selected = sourcePool.slice(0, count);

    return selected.map((item) => ({
      term: item.terms[targetLang] || item.key,
      translation: item.terms[nativeLang] || item.terms.en || '',
      pronunciation: item.pronunciations?.[targetLang] || '',
      transliteration: item.transliterations?.[targetLang] || '',
      exampleSentence: item.examples[targetLang] || '',
      exampleTranslation: item.examples[nativeLang] || item.examples.en || '',
      usageNote: `Offline verified pack (${item.tags.join(', ')})`,
      tags: item.tags,
    }));
  }

  // If AI is enabled:
  const apiKey = getApiKey();
  if (!apiKey) {
    return generateVocabularyCards({ ...params }); // Fallback to offline
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate ${count} language learning flashcards for topic "${topic}" in ${targetLang} with translations into ${nativeLang}.
Return JSON only as an array of objects:
[
  {
    "term": "word in target language",
    "translation": "translation in native language",
    "pronunciation": "phonetic guide",
    "transliteration": "romanization if applicable",
    "exampleSentence": "example sentence",
    "exampleTranslation": "translated sentence",
    "usageNote": "brief note",
    "tags": ["topic"]
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedCard[];
    }
  } catch (err) {
    console.warn('Gemini generation failed, falling back to offline pack:', err);
  }

  // Graceful fallback
  return generateVocabularyCards({ ...params });
}
