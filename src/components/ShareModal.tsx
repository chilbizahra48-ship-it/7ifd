import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { Deck } from '../types';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, deck }) => {
  const { updateDeck } = useSync();
  const { profile } = useAuth();
  const lang = profile?.interfaceLanguage || 'en';

  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#shared/${deck.id}`;

  const togglePublic = async () => {
    setIsUpdating(true);
    try {
      await updateDeck(deck.id, { isPublic: !deck.isPublic });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {getTranslation('action_share', lang)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{deck.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {deck.cardCount} cards • {deck.targetLanguage.toUpperCase()} • {deck.level}
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              {deck.isPublic ? (
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {deck.isPublic ? 'Public Deck' : 'Private Deck'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {deck.isPublic ? 'Accessible to anyone with the link' : 'Only you can view this deck'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={togglePublic}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deck.isPublic
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {deck.isPublic ? 'Make Private' : 'Make Public'}
            </button>
          </div>

          {deck.isPublic && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Your email address and personal review records remain strictly private.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {getTranslation('action_close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
