import { describe, it, expect } from 'vitest';
import { validateCard, buildCatalogueManifest, getManifestSummary } from '../data/manifest';
import { BundledCard } from '../data/contentPacks';

describe('Catalogue Manifest and Content Integrity Validation', () => {
  it('identifies missing translations across 11 languages', () => {
    const incompleteCard: BundledCard = {
      id: 'test-1',
      term: 'apple',
      translations: {
        en: 'apple',
        es: 'manzana',
        fr: 'pomme',
        // missing de, ar, pt, zh-CN, th, hi, ja, ko
      } as any,
      exampleSentence: 'I eat an apple.',
      exampleTranslations: {
        en: 'I eat an apple.',
      } as any,
      tags: [],
    };

    const res = validateCard(incompleteCard, 'en');
    expect(res.isValid).toBe(false);
    expect(res.issues.some((i) => i.includes('Missing term translation for de'))).toBe(true);
    expect(res.issues.some((i) => i.includes('Missing term translation for ar'))).toBe(true);
    expect(res.issues.some((i) => i.includes('Missing example translation for es'))).toBe(true);
  });

  it('builds catalogue manifest covering all 11 languages x 12 categories x 6 levels', () => {
    const manifest = buildCatalogueManifest();
    expect(manifest.length).toBe(11 * 12 * 6); // 792 entries

    const summary = getManifestSummary();
    expect(summary.totalSlots).toBe(792);
    expect(summary.totalValidCards).toBeGreaterThan(0);
  });
});
