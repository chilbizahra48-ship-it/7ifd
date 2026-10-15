import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Share2,
  Settings,
  RotateCcw,
  Search,
  Volume2,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { Card, Deck } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { getTranslation } from '../../i18n/translations';
import { AudioButton } from '../../components/AudioButton';
import { isCardDue } from '../../lib/srs/sm2';
import { CardEditorModal } from '../../components/CardEditorModal';
import { DeckEditorModal } from '../../components/DeckEditorModal';
import { ShareModal } from '../../components/ShareModal';
import { ImportExportModal } from '../../components/ImportExportModal';

interface DeckDetailViewProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (deck: Deck, studyAll?: boolean) => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({ deck, onBack, onStartStudy }) => {
  const { profile } = useAuth();
  const { cards, createCard, updateCard, deleteCard, updateDeck, deleteDeck, resetDeckSRS, decks } = useSync();
  const lang = profile?.interfaceLanguage || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Cards belonging to this deck
  const deckCards = useMemo(() => {
    return cards.filter((c) => c.deckId === deck.id);
  }, [cards, deck.id]);

  const dueCardsCount = useMemo(() => {
    return deckCards.filter((c) => isCardDue(c)).length;
  }, [deckCards]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return deckCards;
    const q = searchQuery.toLowerCase().trim();
    return deckCards.filter(
      (c) =>
        c.term.toLowerCase().includes(q) ||
        c.translation.toLowerCase().includes(q) ||
        (c.exampleSentence && c.exampleSentence.toLowerCase().includes(q))
    );
  }, [deckCards, searchQuery]);

  const handleResetSRS = async () => {
    await resetDeckSRS(deck.id);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Share Deck"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsImportExportOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Import or Export Deck"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeckModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Deck Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deck Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              {deck.targetLanguage.toUpperCase()}
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
              {deck.level}
            </span>
            {deck.isPublic && (
              <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Public Link Enabled
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {deck.title}
          </h1>

          {deck.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {deck.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-medium">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{deckCards.length} cards total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">{dueCardsCount} due today</span>
            </div>
          </div>
        </div>

        {/* Study Call to Action */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onStartStudy(deck, false)}
            disabled={deckCards.length === 0}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all ${
              deckCards.length === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {dueCardsCount > 0
                ? `Study Due Cards (${dueCardsCount})`
                : getTranslation('action_start_studying', lang)}
            </span>
          </button>

          {dueCardsCount === 0 && deckCards.length > 0 && (
            <button
              type="button"
              onClick={() => onStartStudy(deck, true)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-center"
            >
              Review all cards ahead
            </button>
          )}
        </div>
      </div>

      {/* Cards list section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards in this deck..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCardForEdit(null);
                setIsCardModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getTranslation('add_card', lang)}</span>
            </button>
          </div>
        </div>

        {/* Card Items List */}
        {filteredCards.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              {getTranslation('empty_cards_title', lang)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              {getTranslation('empty_cards_desc', lang)}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCardForEdit(null);
                setIsCardModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getTranslation('add_card', lang)}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCards.map((card) => {
              const isDue = isCardDue(card);
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCardForEdit(card);
                    setIsCardModalOpen(true);
                  }}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          isDue
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isDue ? 'Due' : `Int: ${card.srsState?.interval || 0}d`}
                      </span>

                      <AudioButton text={card.term} lang={deck.targetLanguage} size="sm" />
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white break-words">
                      {card.term}
                    </h4>

                    {(card.pronunciation || card.transliteration) && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        {card.pronunciation || card.transliteration}
                      </p>
                    )}

                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 line-clamp-2">
                      {card.translation}
                    </p>
                  </div>

                  {card.exampleSentence && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        "{card.exampleSentence}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset SRS progress */}
      <div className="mt-12 p-5 rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
            {getTranslation('reset_srs_progress', lang)}
          </h4>
          <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
            Resets all review intervals and scheduling parameters for cards in this deck back to new.
          </p>
        </div>

        {isResetConfirmOpen ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700">Are you sure?</span>
            <button
              type="button"
              onClick={handleResetSRS}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-rose-700"
            >
              Yes, Reset
            </button>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-2 py-1.5 text-xs text-slate-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Schedule</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <CardEditorModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCardForEdit(null);
        }}
        initialCard={selectedCardForEdit}
        defaultDeckId={deck.id}
        decks={decks}
        onSave={async (data) => {
          if (selectedCardForEdit) {
            await updateCard(selectedCardForEdit.id, data);
          } else {
            await createCard(data);
          }
        }}
        onDelete={selectedCardForEdit ? async (id) => deleteCard(id) : undefined}
      />

      <DeckEditorModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        initialDeck={deck}
        onSave={async (data) => {
          await updateDeck(deck.id, data);
        }}
        onDelete={async (id) => {
          await deleteDeck(id);
          onBack();
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        deck={deck}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        defaultDeckId={deck.id}
        decks={decks}
      />
    </div>
  );
};
