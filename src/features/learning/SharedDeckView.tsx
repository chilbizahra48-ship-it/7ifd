import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, Plus, Check, Layers, Globe, Shield } from 'lucide-react';
import { db } from '../../lib/firebase/config';
import { Card, Deck } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { AudioButton } from '../../components/AudioButton';
import { getTranslation } from '../../i18n/translations';

interface SharedDeckViewProps {
  deckId: string;
  onBack: () => void;
  onAddedToMyLearning: () => void;
}

export const SharedDeckView: React.FC<SharedDeckViewProps> = ({
  deckId,
  onBack,
  onAddedToMyLearning,
}) => {
  const { profile } = useAuth();
  const { createDeck, createCard } = useSync();
  const lang = profile?.interfaceLanguage || 'en';

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchSharedDeck = async () => {
      setLoading(true);
      try {
        const deckDoc = await getDoc(doc(db, 'decks', deckId));
        if (!deckDoc.exists()) {
          setErrorMsg('Shared deck not found or was removed by its author.');
          setLoading(false);
          return;
        }

        const data = deckDoc.data() as Deck;
        if (!data.isPublic) {
          setErrorMsg('This deck is private and not shared publicly.');
          setLoading(false);
          return;
        }

        setDeck(data);

        // Fetch cards
        const cardsSnap = await getDocs(collection(db, 'decks', deckId, 'cards'));
        const loadedCards: Card[] = [];
        cardsSnap.forEach((doc) => {
          loadedCards.push(doc.data() as Card);
        });

        setCards(loadedCards);
      } catch (err: any) {
        setErrorMsg('Unable to load shared deck: ' + (err.message || 'Permission denied'));
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDeck();
  }, [deckId]);

  const handleCopyDeck = async () => {
    if (!deck) return;
    setIsCopied(true);

    try {
      const newDeck = await createDeck({
        title: `${deck.title} (Shared Copy)`,
        description: deck.description,
        targetLanguage: deck.targetLanguage,
        categoryId: deck.categoryId,
        level: deck.level,
        isPublic: false,
      });

      for (const c of cards) {
        await createCard({
          deckId: newDeck.id,
          term: c.term,
          translation: c.translation,
          translations: c.translations,
          pronunciation: c.pronunciation,
          transliteration: c.transliteration,
          exampleSentence: c.exampleSentence,
          exampleTranslation: c.exampleTranslation,
          exampleTranslations: c.exampleTranslations,
          usageNote: c.usageNote,
          tags: c.tags,
        });
      }

      onAddedToMyLearning();
    } catch {
      setIsCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading shared deck...</p>
      </div>
    );
  }

  if (errorMsg || !deck) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 mb-4">
          {errorMsg}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Learning</span>
      </button>

      {/* Shared Deck Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {deck.targetLanguage.toUpperCase()}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              {deck.level}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Publicly Shared</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {deck.title}
          </h1>

          {deck.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              {deck.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>{cards.length} cards in this shared deck</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyDeck}
          disabled={isCopied}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCopied ? 'Added to My Learning' : 'Copy Deck to My Learning'}</span>
        </button>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div
            key={c.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white break-words">{c.term}</h4>
              <AudioButton text={c.term} lang={deck.targetLanguage} size="sm" />
            </div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">{c.translation}</p>
            {c.exampleSentence && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 line-clamp-2">
                "{c.exampleSentence}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
