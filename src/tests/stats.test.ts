import { describe, it, expect } from 'vitest';
import { calculateStreaks, calculateStudyStats, formatDateKey } from '../lib/srs/stats';
import { Card, StudyEvent } from '../types';

describe('Study Statistics and Streak Calculation', () => {
  it('formats date key accurately according to timezone', () => {
    const d = new Date('2026-06-15T01:30:00Z');
    const key = formatDateKey(d, 'UTC');
    expect(key).toBe('2026-06-15');
  });

  it('calculates current streak accurately for consecutive days', () => {
    const now = new Date('2026-06-15T10:00:00Z');
    const history: Record<string, number> = {
      '2026-06-15': 5,
      '2026-06-14': 10,
      '2026-06-13': 8,
    };

    const { currentStreak, bestStreak } = calculateStreaks(history, now, 'UTC');
    expect(currentStreak).toBe(3);
    expect(bestStreak).toBe(3);
  });

  it('preserves streak if studied yesterday but not yet today', () => {
    const now = new Date('2026-06-15T10:00:00Z');
    const history: Record<string, number> = {
      '2026-06-14': 12,
      '2026-06-13': 5,
      '2026-06-12': 7,
    };

    const { currentStreak } = calculateStreaks(history, now, 'UTC');
    expect(currentStreak).toBe(3);
  });

  it('resets streak to 0 if a day was skipped', () => {
    const now = new Date('2026-06-15T10:00:00Z');
    const history: Record<string, number> = {
      '2026-06-13': 10, // Skipped 2026-06-14
      '2026-06-12': 5,
    };

    const { currentStreak, bestStreak } = calculateStreaks(history, now, 'UTC');
    expect(currentStreak).toBe(0);
    expect(bestStreak).toBe(2);
  });

  it('derives total reviews and learned card count without fake data', () => {
    const cards: Card[] = [
      {
        id: 'c1',
        deckId: 'd1',
        ownerId: 'u1',
        term: 'cat',
        translation: 'gato',
        tags: [],
        srsState: { state: 'review', interval: 10, easeFactor: 2.5, repetitions: 3, lapses: 0, nextDueAt: '2026-06-20T00:00:00Z' },
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 'c2',
        deckId: 'd1',
        ownerId: 'u1',
        term: 'dog',
        translation: 'perro',
        tags: [],
        srsState: { state: 'learning', interval: 1, easeFactor: 2.3, repetitions: 0, lapses: 1, nextDueAt: '2026-06-10T00:00:00Z' },
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
    ];

    const events: StudyEvent[] = [
      { id: 'e1', userId: 'u1', deckId: 'd1', cardId: 'c1', rating: 'good', reviewTimestamp: '2026-06-15T08:00:00Z', interval: 10, easeFactor: 2.5, durationMs: 2000 },
      { id: 'e2', userId: 'u1', deckId: 'd1', cardId: 'c2', rating: 'again', reviewTimestamp: '2026-06-15T08:05:00Z', interval: 1, easeFactor: 2.3, durationMs: 1500 },
    ];

    const stats = calculateStudyStats(cards, events, 20, 'UTC', new Date('2026-06-15T12:00:00Z'));
    expect(stats.totalReviews).toBe(2);
    expect(stats.uniqueCardsReviewed).toBe(2);
    expect(stats.cardsLearned).toBe(1); // c1 has interval 10 & repetitions 3
    expect(stats.todayReviewsCount).toBe(2);
    expect(stats.dailyGoalProgress).toBe(10); // 2 of 20 = 10%
  });
});
