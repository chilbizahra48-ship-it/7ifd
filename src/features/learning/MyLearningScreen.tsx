import React, { useState, useMemo } from 'react';
import {
  Plus,
  Play,
  Upload,
  Search,
  Filter,
  Copy,
  Share2,
  MoreVertical,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  ArrowUpDown,
} from 'lucide-react';
import { Deck, ReviewRating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { getTranslation } from '../../i18n/translations';
import { isCardDue } from '../../lib/srs/sm2';
import { DeckEditorModal } from '../../components/DeckEditorModal';
import { ImportExportModal } from '../../components/ImportExportModal';
import { ShareModal } from '../../components/ShareModal';

interface MyLearningScreenProps {
  onOpenDeck: (deck: Deck) => void;
  onStartStudy: (deck: Deck) => void;
  onNavigateExplore: () => void;
}

export const MyLearningScreen: React.FC<MyLearningScreenProps> = ({
  onOpenDeck,
  onStartStudy,
  onNavigateExplore,
}) => {
  const { profile } = useAuth();
  const { decks, cards, stats, createDeck, updateDeck, deleteDeck, duplicateDeck } = useSync();
  const lang = profile?.interfaceLanguage || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due' | 'name' | 'modified'>('due');

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [shareDeckTarget, setShareDeckTarget] = useState<Deck | null>(null);

  // Calculate cards due per deck
  const deckStatsMap = useMemo(() => {
    const map: Record<string, { total: number; due: number; newCount: number }> = {};
    decks.forEach((d) => {
      const dCards = cards.filter((c) => c.deckId === d.id);
      const dueCount = dCards.filter((c) => isCardDue(c)).length;
      const newCount = dCards.filter((c) => !c.srsState || c.srsState.state === 'new').length;
      map[d.id] = { total: dCards.length, due: dueCount, newCount };
    });
    return map;
  }, [decks, cards]);

  // Total due cards across all decks
  const totalDueCards = useMemo(() => {
    return Object.values(deckStatsMap).reduce((acc, s) => acc + s.due, 0);
  }, [deckStatsMap]);

  // Filter & sort decks
  const filteredDecks = useMemo(() => {
    return decks
      .filter((d) => {
        const matchesSearch =
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.targetLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLang = selectedLanguageFilter === 'all' || d.targetLanguage === selectedLanguageFilter;
        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'due') {
          const dueA = deckStatsMap[a.id]?.due || 0;
          const dueB = deckStatsMap[b.id]?.due || 0;
          return dueB - dueA;
        } else if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        } else {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
  }, [decks, searchQuery, selectedLanguageFilter, sortBy, deckStatsMap]);

  // Quick primary deck to continue studying (the one with the most due cards)
  const primaryDueDeck = useMemo(() => {
    const decksWithDue = decks
      .filter((d) => (deckStatsMap[d.id]?.due || 0) > 0)
      .sort((a, b) => (deckStatsMap[b.id]?.due || 0) - (deckStatsMap[a.id]?.due || 0));
    return decksWithDue[0] || (decks.length > 0 ? decks[0] : null);
  }, [decks, deckStatsMap]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Welcome & Genuine Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getTranslation('my_learning_title', lang)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {getTranslation('my_learning_subtitle', lang)}
            </p>
          </div>

          {/* Genuine study metrics widget */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Daily streak */}
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white block leading-none">
                  {stats.currentStreak}
                </span>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {getTranslation('streak_days', lang)}
                </span>
              </div>
            </div>

            {/* Daily Goal */}
            <div className="px-4 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white block leading-none">
                  {stats.todayReviewsCount} / {profile?.dailyGoalCards || 20}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  {getTranslation('daily_goal_progress', lang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Study Banner if due cards exist */}
        {primaryDueDeck && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                {deckStatsMap[primaryDueDeck.id]?.due || 0}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {deckStatsMap[primaryDueDeck.id]?.due || 0 > 0
                    ? `Ready for Review: ${primaryDueDeck.title}`
                    : `Study Ready: ${primaryDueDeck.title}`}
                </span>
                <span className="text-[11px] text-slate-400">
                  {deckStatsMap[primaryDueDeck.id]?.due || 0} cards due right now
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartStudy(primaryDueDeck)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{getTranslation('action_start_studying', lang)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Control bar: search, filters, actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation('search_decks_placeholder', lang)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="due">{getTranslation('sort_due', lang)}</option>
              <option value="name">{getTranslation('sort_name', lang)}</option>
              <option value="modified">{getTranslation('sort_modified', lang)}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{getTranslation('action_import', lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateDeckOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{getTranslation('create_new_deck', lang)}</span>
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {getTranslation('empty_decks_title', lang)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            {getTranslation('empty_decks_desc', lang)}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateDeckOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {getTranslation('create_new_deck', lang)}
            </button>
            <button
              type="button"
              onClick={onNavigateExplore}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              {getTranslation('nav_explore', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => {
            const stats = deckStatsMap[deck.id] || { total: 0, due: 0, newCount: 0 };
            return (
              <div
                key={deck.id}
                onClick={() => onOpenDeck(deck)}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {deck.targetLanguage.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                        {deck.level}
                      </span>
                    </div>

                    {stats.due > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        {stats.due} {getTranslation('card_due', lang)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                    {deck.title}
                  </h3>

                  {deck.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}
                </div>

                {/* Footer metrics & fast study button */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-medium">
                    <span>{stats.total} {getTranslation('cards_count', lang)}</span>
                    {stats.newCount > 0 && <span> • {stats.newCount} new</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareDeckTarget(deck);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Share Deck"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateDeck(deck.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate Deck"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartStudy(deck);
                      }}
                      disabled={stats.total === 0}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg"
                      title="Study Now"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Deck Modal */}
      <DeckEditorModal
        isOpen={isCreateDeckOpen}
        onClose={() => setIsCreateDeckOpen(false)}
        onSave={async (data) => {
          await createDeck(data);
        }}
      />

      {/* Share Modal */}
      {shareDeckTarget && (
        <ShareModal
          isOpen={Boolean(shareDeckTarget)}
          onClose={() => setShareDeckTarget(null)}
          deck={shareDeckTarget}
        />
      )}

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        decks={decks}
      />
    </div>
  );
};
