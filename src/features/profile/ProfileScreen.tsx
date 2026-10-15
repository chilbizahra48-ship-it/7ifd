import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Globe,
  Target,
  Languages,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  LogOut,
  Download,
  Upload,
  KeyRound,
  Moon,
  Sun,
  Monitor,
  Check,
} from 'lucide-react';
import { CEFRLevel, CEFR_LEVELS, LanguageCode, SUPPORTED_LANGUAGES, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { getTranslation } from '../../i18n/translations';

export const ProfileScreen: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, profile, updateProfileSettings, signOutUser, resetPassword } = useAuth();
  const { stats, exportDataBackup, restoreDataBackup } = useSync();
  const { theme, setTheme, isRTL } = useTheme();

  const lang = profile?.interfaceLanguage || 'en';

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [interfaceLang, setInterfaceLang] = useState<LanguageCode>(profile?.interfaceLanguage || 'en');
  const [targetLang, setTargetLang] = useState<LanguageCode>(profile?.targetLanguage || 'es');
  const [transLang, setTransLang] = useState<LanguageCode>(profile?.preferredTranslationLanguage || 'en');
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(profile?.currentLevel || 'A1');
  const [dailyGoal, setDailyGoal] = useState<number>(profile?.dailyGoalCards || 20);

  const [savedNotice, setSavedNotice] = useState(false);
  const [resetSentNotice, setResetSentNotice] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileSettings({
      displayName: displayName.trim(),
      interfaceLanguage: interfaceLang,
      targetLanguage: targetLang,
      preferredTranslationLanguage: transLang,
      currentLevel,
      dailyGoalCards: dailyGoal,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportBackup = async () => {
    const jsonStr = await exportDataBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `7ifd_account_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await restoreDataBackup(content);
      setRestoreMessage(res.message);
      setTimeout(() => setRestoreMessage(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleSendPasswordReset = async () => {
    if (user && user.email) {
      await resetPassword(user.email);
      setResetSentNotice(true);
      setTimeout(() => setResetSentNotice(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {getTranslation('profile_title', lang)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personal identity, language settings, verifiable statistics, and backup portability.
        </p>
      </div>

      {/* Real Statistics Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {getTranslation('stats_section', lang)}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {getTranslation('streak_days', lang)}
            </span>
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.currentStreak}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Best: {stats.bestStreak} days</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {getTranslation('total_reviews', lang)}
            </span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.totalReviews}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Persistent events</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {getTranslation('cards_learned', lang)}
            </span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {stats.cardsLearned}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Interval &gt;= 7 days</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              {getTranslation('card_due', lang)}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.dueCardsCount}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Ready today</span>
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {getTranslation('account_section', lang)}
        </h2>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {user.displayName || profile?.displayName || 'User'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 block font-semibold mt-0.5">
                  Authenticated with Firebase
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendPasswordReset}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={signOutUser}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{getTranslation('nav_sign_out', lang)}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 block">
                Local Guest Profile
              </span>
              <span className="text-xs text-indigo-700/80 dark:text-indigo-300">
                Your cards and progress are stored safely in IndexedDB on this device. Sign in to sync across devices.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
            >
              Sign In or Register
            </button>
          </div>
        )}

        {resetSentNotice && (
          <p className="text-xs text-teal-600 font-semibold">{getTranslation('auth_reset_sent_message', lang)}</p>
        )}
      </div>

      {/* Language & Study Configuration Form */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {getTranslation('preferences_section', lang)}
          </h2>
          {savedNotice && (
            <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Settings Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Interface Language (independent) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('interface_lang_label', lang)}
            </label>
            <select
              value={interfaceLang}
              onChange={(e) => setInterfaceLang(e.target.value as LanguageCode)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Target Language (independent) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('target_lang_label', lang)}
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Translation Language (independent) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('trans_lang_label', lang)}
            </label>
            <select
              value={transLang}
              onChange={(e) => setTransLang(e.target.value as LanguageCode)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('current_level_label', lang)}
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as CEFRLevel)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl.level} value={lvl.level}>
                  {lvl.level} - {lvl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {getTranslation('daily_goal_label', lang)}
            </label>
            <input
              type="number"
              min={5}
              max={200}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            {getTranslation('action_save', lang)}
          </button>
        </div>
      </form>

      {/* Backup and Portability */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {getTranslation('backup_section', lang)}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download your complete personal learning data (decks, cards, study logs) as a portable JSON document. You can
          restore it on any device.
        </p>

        {restoreMessage && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs rounded-xl font-medium">
            {restoreMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>{getTranslation('export_backup_btn', lang)}</span>
          </button>

          <button
            type="button"
            onClick={() => backupFileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-teal-500" />
            <span>{getTranslation('restore_backup_btn', lang)}</span>
          </button>
          <input
            ref={backupFileInputRef}
            type="file"
            accept=".json,application/json,text/plain,*/*"
            onChange={handleRestoreFile}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = '';
            }}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
