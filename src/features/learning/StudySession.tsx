import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { Card, Deck, ReviewRating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { getTranslation } from '../../i18n/translations';
import { AudioButton } from '../../components/AudioButton';
import { isCardDue } from '../../lib/srs/sm2';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
  studyAll?: boolean;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, onExit, studyAll = false }) => {
  const { profile } = useAuth();
  const { cards, reviewCard } = useSync();
  const lang = profile?.interfaceLanguage || 'en';

  // Queue of cards eligible for review
  const queue = useMemo(() => {
    const deckCards = cards.filter((c) => c.deckId === deck.id);
    if (studyAll) return deckCards;
    return deckCards.filter((c) => isCardDue(c));
  }, [cards, deck.id, studyAll]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedInSessionCount, setReviewedInSessionCount] = useState(0);

  const currentCard: Card | undefined = queue[currentIndex];

  useEffect(() => {
    setIsRevealed(false);
    setStartTime(Date.now());
  }, [currentIndex]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleRating = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;

      const durationMs = Date.now() - startTime;
      await reviewCard(currentCard.id, rating, durationMs);
      setReviewedInSessionCount((prev) => prev + 1);

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsRevealed(false);
      } else {
        setSessionCompleted(true);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    },
    [currentCard, currentIndex, queue.length, reviewCard, startTime]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        }
      } else if (isRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRating('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRating('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRating('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRating('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, sessionCompleted, handleRating, handleReveal]);

  if (sessionCompleted || queue.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-90 duration-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          {getTranslation('session_completed_title', lang)}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {queue.length === 0
            ? getTranslation('no_cards_due', lang)
            : getTranslation('session_completed_desc', lang)}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl w-full mb-6 border border-slate-200 dark:border-slate-700/60">
          <span className="text-xs text-slate-400 block mb-1">Cards reviewed in this session</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {reviewedInSessionCount}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            {getTranslation('action_continue', lang)}
          </button>
          {queue.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setIsRevealed(false);
                setSessionCompleted(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {getTranslation('study_ahead', lang)}
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 flex flex-col min-h-[85vh]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
            {deck.title}
          </span>
          <span className="text-[10px] text-slate-400">
            {currentIndex + 1} of {queue.length}
          </span>
        </div>

        <div className="w-16 flex justify-end">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Spaced Repetition Flashcard */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col min-h-[340px] justify-between relative transition-all">
          {/* Audio Action Button */}
          <div className="absolute top-5 right-5">
            <AudioButton text={currentCard.term} lang={deck.targetLanguage} size="md" />
          </div>

          {/* Front / Target Word */}
          <div className="text-center my-auto py-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2 block">
              {deck.targetLanguage.toUpperCase()} • {deck.level}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words mb-2">
              {currentCard.term}
            </h1>

            {/* Pronunciation / Transliteration */}
            {(currentCard.pronunciation || currentCard.transliteration) && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono mt-1">
                {currentCard.pronunciation && <span>{currentCard.pronunciation}</span>}
                {currentCard.pronunciation && currentCard.transliteration && <span>•</span>}
                {currentCard.transliteration && <span>{currentCard.transliteration}</span>}
              </div>
            )}
          </div>

          {/* Back / Meaning (Revealed State) */}
          {isRevealed && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Meaning / Translation
              </span>
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
                {currentCard.translation}
              </p>

              {/* Example sentence */}
              {currentCard.exampleSentence && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}

              {/* Usage Note */}
              {currentCard.usageNote && (
                <p className="text-[11px] text-slate-400 mt-2 italic text-left">
                  Note: {currentCard.usageNote}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Actions / Reveal Button */}
      <div className="mt-6">
        {!isRevealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{getTranslation('action_reveal_answer', lang)}</span>
            <span className="text-[11px] opacity-75 hidden sm:inline">(Space)</span>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 animate-in fade-in duration-200">
            {/* 1: Again */}
            <button
              type="button"
              onClick={() => handleRating('again')}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shadow-xs"
            >
              <span className="text-xs font-bold">{getTranslation('rating_again', lang)}</span>
              <span className="text-[10px] text-rose-500 mt-0.5">&lt; 1d (1)</span>
            </button>

            {/* 2: Hard */}
            <button
              type="button"
              onClick={() => handleRating('hard')}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all shadow-xs"
            >
              <span className="text-xs font-bold">{getTranslation('rating_hard', lang)}</span>
              <span className="text-[10px] text-amber-500 mt-0.5">1-2d (2)</span>
            </button>

            {/* 3: Good */}
            <button
              type="button"
              onClick={() => handleRating('good')}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs"
            >
              <span className="text-xs font-bold">{getTranslation('rating_good', lang)}</span>
              <span className="text-[10px] text-indigo-500 mt-0.5">3-6d (3)</span>
            </button>

            {/* 4: Easy */}
            <button
              type="button"
              onClick={() => handleRating('easy')}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all shadow-xs"
            >
              <span className="text-xs font-bold">{getTranslation('rating_easy', lang)}</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">7-10d (4)</span>
            </button>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-3 hidden sm:block">
          {getTranslation('action_show_shortcuts', lang)}
        </p>
      </div>
    </div>
  );
};
