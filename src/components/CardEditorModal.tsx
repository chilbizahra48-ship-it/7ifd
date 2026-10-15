import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Card, Deck } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: {
    deckId: string;
    term: string;
    translation: string;
    pronunciation?: string;
    transliteration?: string;
    exampleSentence?: string;
    exampleTranslation?: string;
    usageNote?: string;
    tags: string[];
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialCard?: Card | null;
  defaultDeckId?: string;
  decks: Deck[];
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCard,
  defaultDeckId,
  decks,
}) => {
  const { profile } = useAuth();
  const lang = profile?.interfaceLanguage || 'en';

  const [deckId, setDeckId] = useState<string>(defaultDeckId || (decks[0]?.id ?? ''));
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialCard) {
      setDeckId(initialCard.deckId);
      setTerm(initialCard.term);
      setTranslation(initialCard.translation);
      setPronunciation(initialCard.pronunciation || '');
      setTransliteration(initialCard.transliteration || '');
      setExampleSentence(initialCard.exampleSentence || '');
      setExampleTranslation(initialCard.exampleTranslation || '');
      setUsageNote(initialCard.usageNote || '');
      setTagsInput(initialCard.tags?.join(', ') || '');
    } else {
      setDeckId(defaultDeckId || (decks[0]?.id ?? ''));
      setTerm('');
      setTranslation('');
      setPronunciation('');
      setTransliteration('');
      setExampleSentence('');
      setExampleTranslation('');
      setUsageNote('');
      setTagsInput('');
    }
    setErrorMsg('');
    setShowConfirmDelete(false);
  }, [initialCard, defaultDeckId, decks, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      setErrorMsg('Target expression is required.');
      return;
    }
    if (!translation.trim()) {
      setErrorMsg('Translation / meaning is required.');
      return;
    }
    if (!deckId) {
      setErrorMsg('Please select a destination deck.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        deckId,
        term: term.trim(),
        translation: translation.trim(),
        pronunciation: pronunciation.trim() || undefined,
        transliteration: transliteration.trim() || undefined,
        exampleSentence: exampleSentence.trim() || undefined,
        exampleTranslation: exampleTranslation.trim() || undefined,
        usageNote: usageNote.trim() || undefined,
        tags,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialCard || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(initialCard.id);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to delete card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {initialCard ? getTranslation('action_edit', lang) : getTranslation('add_card', lang)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Deck select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('deck_select_label', lang)}
            </label>
            <select
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.targetLanguage.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Front & Back */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('card_front_label', lang)} *
              </label>
              <textarea
                required
                rows={2}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={getTranslation('card_front_placeholder', lang)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('card_back_label', lang)} *
              </label>
              <textarea
                required
                rows={2}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder={getTranslation('card_back_placeholder', lang)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pronunciation & Transliteration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('pronunciation_label', lang)}
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder={getTranslation('pronunciation_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('transliteration_label', lang)}
              </label>
              <input
                type="text"
                value={transliteration}
                onChange={(e) => setTransliteration(e.target.value)}
                placeholder={getTranslation('transliteration_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Example sentence & Translation */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('example_sentence_label', lang)}
              </label>
              <input
                type="text"
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder={getTranslation('example_sentence_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('example_trans_label', lang)}
              </label>
              <input
                type="text"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder={getTranslation('example_trans_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Usage Note & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('usage_note_label', lang)}
              </label>
              <input
                type="text"
                value={usageNote}
                onChange={(e) => setUsageNote(e.target.value)}
                placeholder={getTranslation('usage_note_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {getTranslation('tags_label', lang)}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={getTranslation('tags_placeholder', lang)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {initialCard && onDelete ? (
            showConfirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-semibold">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{getTranslation('action_delete', lang)}</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {getTranslation('action_cancel', lang)}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{getTranslation('action_save', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
