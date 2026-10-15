import { describe, it, expect } from 'vitest';
import { calculateNextSRS, isCardDue, resetCardSRS, INITIAL_SRS_STATE } from '../lib/srs/sm2';
import { Card } from '../types';

describe('SM-2 Spaced Repetition Scheduling Engine', () => {
  it('initializes card with new state and zero interval', () => {
    expect(INITIAL_SRS_STATE.state).toBe('new');
    expect(INITIAL_SRS_STATE.interval).toBe(0);
    expect(INITIAL_SRS_STATE.easeFactor).toBe(2.5);
    expect(INITIAL_SRS_STATE.repetitions).toBe(0);
    expect(INITIAL_SRS_STATE.lapses).toBe(0);
  });

  it('schedules "again" rating as a lapse with 1 day interval', () => {
    const now = new Date('2026-05-10T12:00:00Z');
    const result = calculateNextSRS(INITIAL_SRS_STATE, 'again', now);

    expect(result.state).toBe('relearning');
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
    expect(result.lapses).toBe(1);
    expect(result.easeFactor).toBe(2.3);
    expect(new Date(result.nextDueAt).getTime()).toBe(now.getTime() + 24 * 60 * 60 * 1000);
  });

  it('schedules progression for "good" ratings across repetitions', () => {
    const now = new Date('2026-05-10T12:00:00Z');
    // First good review
    const rep1 = calculateNextSRS(INITIAL_SRS_STATE, 'good', now);
    expect(rep1.state).toBe('review');
    expect(rep1.repetitions).toBe(1);
    expect(rep1.interval).toBe(1);

    // Second good review
    const rep2 = calculateNextSRS(rep1, 'good', now);
    expect(rep2.repetitions).toBe(2);
    expect(rep2.interval).toBe(6);

    // Third good review (interval = 6 * 2.5 = 15)
    const rep3 = calculateNextSRS(rep2, 'good', now);
    expect(rep3.repetitions).toBe(3);
    expect(rep3.interval).toBe(15);
  });

  it('boosts interval and ease factor on "easy" ratings', () => {
    const now = new Date('2026-05-10T12:00:00Z');
    const rep1 = calculateNextSRS(INITIAL_SRS_STATE, 'easy', now);
    expect(rep1.interval).toBe(4);
    expect(rep1.easeFactor).toBe(2.65);
    expect(rep1.repetitions).toBe(1);
  });

  it('accurately identifies when a card is due', () => {
    const now = new Date('2026-05-10T12:00:00Z');
    const past = new Date('2026-05-09T12:00:00Z');
    const future = new Date('2026-05-15T12:00:00Z');

    const dueCard: Card = {
      id: 'c1',
      deckId: 'd1',
      ownerId: 'u1',
      term: 'bonjour',
      translation: 'hello',
      tags: [],
      srsState: {
        state: 'review',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        lapses: 0,
        nextDueAt: past.toISOString(),
      },
      createdAt: past.toISOString(),
      updatedAt: past.toISOString(),
    };

    const notDueCard: Card = {
      ...dueCard,
      srsState: {
        ...dueCard.srsState,
        nextDueAt: future.toISOString(),
      },
    };

    expect(isCardDue(dueCard, now)).toBe(true);
    expect(isCardDue(notDueCard, now)).toBe(false);
  });

  it('resets card SRS to initial values', () => {
    const reset = resetCardSRS();
    expect(reset.repetitions).toBe(0);
    expect(reset.lapses).toBe(0);
    expect(reset.interval).toBe(0);
    expect(reset.state).toBe('new');
  });
});
