import { Card, StudyEvent, StudyStats } from '../../types';
import { isCardDue } from './sm2';

/**
 * Calculates genuine study statistics from persisted cards and study events
 */
export function calculateStudyStats(
  cards: Card[],
  events: StudyEvent[],
  dailyGoalCards: number = 20,
  timeZone?: string,
  referenceDate: Date = new Date()
): StudyStats {
  const totalReviews = events.length;

  // Unique cards reviewed
  const uniqueCardIds = new Set<string>();
  events.forEach((e) => uniqueCardIds.add(e.cardId));
  const uniqueCardsReviewed = uniqueCardIds.size;

  // Cards learned: cards in 'review' state with interval >= 7 days or repetitions >= 2
  const cardsLearned = cards.filter(
    (c) => c.srsState && (c.srsState.interval >= 7 || c.srsState.repetitions >= 2)
  ).length;

  // Due cards count right now
  const now = referenceDate;
  const dueCardsCount = cards.filter((c) => isCardDue(c, now)).length;

  // Map review events to local date string YYYY-MM-DD
  const historyByDate: Record<string, number> = {};
  events.forEach((ev) => {
    try {
      const d = new Date(ev.reviewTimestamp);
      // Format with user's timeZone if available
      const dateKey = formatDateKey(d, timeZone);
      historyByDate[dateKey] = (historyByDate[dateKey] || 0) + 1;
    } catch {
      // Ignore malformed date
    }
  });

  const todayKey = formatDateKey(now, timeZone);
  const todayReviewsCount = historyByDate[todayKey] || 0;
  const dailyGoalProgress = Math.min(100, Math.round((todayReviewsCount / Math.max(1, dailyGoalCards)) * 100));

  // Calculate genuine streak
  const { currentStreak, bestStreak } = calculateStreaks(historyByDate, now, timeZone);

  return {
    totalReviews,
    uniqueCardsReviewed,
    cardsLearned,
    dueCardsCount,
    currentStreak,
    bestStreak,
    todayReviewsCount,
    dailyGoalProgress,
    historyByDate,
  };
}

/**
 * Helper to format date into YYYY-MM-DD in the designated timezone
 */
export function formatDateKey(date: Date, timeZone?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Calculates current and best continuous day streaks
 */
export function calculateStreaks(
  historyByDate: Record<string, number>,
  referenceDate: Date = new Date(),
  timeZone?: string
): { currentStreak: number; bestStreak: number } {
  const dates = Object.keys(historyByDate)
    .filter((k) => historyByDate[k] > 0)
    .sort();

  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayKey = formatDateKey(referenceDate, timeZone);
  const yesterday = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = formatDateKey(yesterday, timeZone);

  // Check if today or yesterday had study activity
  let currentStreak = 0;
  let checkDate = new Date(referenceDate);

  // If user hasn't studied today yet, check if yesterday was active
  if (!historyByDate[todayKey]) {
    if (!historyByDate[yesterdayKey]) {
      currentStreak = 0;
    } else {
      checkDate = yesterday;
    }
  }

  if (historyByDate[todayKey] || historyByDate[yesterdayKey]) {
    while (true) {
      const key = formatDateKey(checkDate, timeZone);
      if (historyByDate[key] && historyByDate[key] > 0) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate best streak in the entire history
  let bestStreak = 0;
  let tempStreak = 0;
  let prevTimestamp = 0;

  dates.forEach((dStr) => {
    const parts = dStr.split('-').map(Number);
    const dTime = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

    if (prevTimestamp === 0) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((dTime - prevTimestamp) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTimestamp = dTime;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  });

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}
