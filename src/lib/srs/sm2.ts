import { ReviewRating, SRSCardState, Card } from '../../types';

export const INITIAL_SRS_STATE: SRSCardState = {
  state: 'new',
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  lapses: 0,
  nextDueAt: new Date(0).toISOString(), // Immediately due when new
};

/**
 * SM-2 Algorithm calculation
 * @param current Current card SRS state
 * @param rating User feedback: again (1), hard (2), good (3), easy (4)
 * @param reviewDate Optional date of review (defaults to now)
 */
export function calculateNextSRS(
  current: SRSCardState,
  rating: ReviewRating,
  reviewDate: Date = new Date()
): SRSCardState {
  const currentInterval = current.interval || 0;
  let ease = current.easeFactor || 2.5;
  let repetitions = current.repetitions || 0;
  let lapses = current.lapses || 0;
  let nextInterval: number;
  let nextState: SRSCardState['state'] = 'review';

  switch (rating) {
    case 'again': {
      // Failed recall
      repetitions = 0;
      lapses += 1;
      nextInterval = 1; // repeat tomorrow or after session
      // Decrease ease factor
      ease = Math.max(1.3, ease - 0.2);
      nextState = 'relearning';
      break;
    }

    case 'hard': {
      // Recalled with difficulty
      if (repetitions === 0) {
        nextInterval = 1;
        repetitions = 1;
      } else {
        nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
      }
      ease = Math.max(1.3, ease - 0.15);
      nextState = 'learning';
      break;
    }

    case 'good': {
      // Standard successful recall
      if (repetitions === 0) {
        nextInterval = 1;
      } else if (repetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.max(2, Math.round(currentInterval * ease));
      }
      repetitions += 1;
      nextState = 'review';
      break;
    }

    case 'easy': {
      // Effortless recall
      if (repetitions === 0) {
        nextInterval = 4;
      } else if (repetitions === 1) {
        nextInterval = 10;
      } else {
        nextInterval = Math.max(3, Math.round(currentInterval * ease * 1.3));
      }
      repetitions += 1;
      ease = Math.min(3.2, ease + 0.15);
      nextState = 'review';
      break;
    }
  }

  // Calculate next due timestamp
  const nextDue = new Date(reviewDate.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  return {
    state: nextState,
    interval: nextInterval,
    easeFactor: Number(ease.toFixed(2)),
    repetitions,
    lapses,
    lastReviewedAt: reviewDate.toISOString(),
    nextDueAt: nextDue.toISOString(),
  };
}

/**
 * Checks if a card is currently due for review
 */
export function isCardDue(card: Card, now: Date = new Date()): boolean {
  if (!card.srsState) return true;
  if (card.srsState.state === 'new') return true;
  const due = new Date(card.srsState.nextDueAt);
  return due.getTime() <= now.getTime();
}

/**
 * Reset card SRS progress to brand new
 */
export function resetCardSRS(): SRSCardState {
  return { ...INITIAL_SRS_STATE, nextDueAt: new Date().toISOString() };
}
