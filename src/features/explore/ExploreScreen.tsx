import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Plus,
  Eye,
  Check,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  Globe,
  Download,
  Smartphone,
} from 'lucide-react';
import { CEFRLevel, CEFR_LEVELS, Deck, LanguageCode, SUPPORTED_LANGUAGES } from '../../types';
import { SUBJECT_CATEGORIES } from '../../data/categories';
import { getDeckWith50Cards } from '../../data/domainCardsProvider';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { AudioButton } from '../../components/AudioButton';
import { PWAInstallButton } from '../../components/PWAInstallButton';
import { DomainIllustration } from '../../components/DomainIllustration';
import { BundledDeck } from '../../data/contentPacks';

interface ExploreScreenProps {
  onNavigateToMyLearning: () => void;
  onStartStudy?: (deck: Deck) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onNavigateToMyLearning,
  onStartStudy,
}) => {
  const { profile } = useAuth();
  const { decks, copyExploreDeckToMyLearning } = useSync();
  const lang = profile?.interfaceLanguage || 'en';
  const isArabic = lang === 'ar';

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(profile?.targetLanguage || 'en');
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [activeLevelPreview, setActiveLevelPreview] = useState<{ level: CEFRLevel; deck: BundledDeck } | null>(null);

  const [addingLevel, setAddingLevel] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Exactly 8 organized domains
  const categories = SUBJECT_CATEGORIES.slice(0, 8);
  const activeCategory = categories.find((c) => c.id === selectedDomainId);

  // Check if user already copied a specific deck
  const isDeckInLibrary = (deckId: string) => {
    return decks.some((d) => d.sourceDeckId === deckId || d.id === deckId);
  };

  const handleAddLevelToLibrary = async (bundledDeck: BundledDeck) => {
    setAddingLevel(bundledDeck.id);
    try {
      await copyExploreDeckToMyLearning(bundledDeck);
      setAddedNotice(
        isArabic
          ? `تمت إضافة 50 بطاقة للمستوى ${bundledDeck.level} إلى قسم تعلّمي بنجاح!`
          : `Added 50 cards for Level ${bundledDeck.level} to My Learning!`
      );
      setTimeout(() => setAddedNotice(null), 3500);
    } finally {
      setAddingLevel(null);
    }
  };

  const handleStartStudyingDeck = async (bundledDeck: BundledDeck) => {
    const existing = decks.find((d) => d.sourceDeckId === bundledDeck.id || d.id === bundledDeck.id);
    if (existing && onStartStudy) {
      onStartStudy(existing);
    } else {
      const personalCopy = await copyExploreDeckToMyLearning(bundledDeck);
      if (onStartStudy) {
        onStartStudy(personalCopy);
      } else {
        onNavigateToMyLearning();
      }
    }
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" className="mb-2" />

      {/* Added notice alert */}
      {addedNotice && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs text-teal-800 dark:text-teal-300 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-bold text-sm">{addedNotice}</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToMyLearning}
            className="font-extrabold underline ml-4 hover:opacity-80 shrink-0"
          >
            {isArabic ? 'الانتقال إلى تعلّمي ←' : 'Go to My Learning →'}
          </button>
        </div>
      )}

      {/* Main View: 8 Domains OR Domain Drill-Down */}
      {!selectedDomainId ? (
        <div className="space-y-6">
          {/* Header Banner with official 7ifd logo */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/icon.svg"
                alt="7ifd Logo"
                className="w-16 h-16 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0 object-contain"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {isArabic ? 'تصفح مجالات التعلم' : 'Explore Learning Domains'}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                    {isArabic ? '8 مجالات منظمة' : '8 Organized Domains'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  {isArabic
                    ? 'اختر أحد المجالات الـ 8 الأساسية واستعرض المستويات من A1 إلى C2؛ كل مستوى يحتوي على 50 بطاقة تعليمية معتمدة ومترجمة بالكامل.'
                    : 'Choose from 8 core domains with levels A1 through C2; each level includes exactly 50 validated, fully translated vocabulary cards.'}
                </p>
              </div>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                  {isArabic ? '50 بطاقة لكل مستوى' : '50 Cards per Level'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isArabic ? '300 بطاقة في كل مجال • 6 مستويات' : '300 cards per domain • 6 levels'}
                </span>
              </div>
            </div>
          </div>

          {/* Target Language Selection Chips */}
          <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>{isArabic ? 'اللغة المستهدفة للدراسة:' : 'Target Learning Language:'}</span>
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                {currentLangInfo?.flag} {currentLangInfo?.name}
              </span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLanguage(l.code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedLanguage === l.code
                      ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-400/50'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* The 8 Organized Domains Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, idx) => {
              const domainNumber = idx + 1;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedDomainId(cat.id)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-xl transition-all cursor-pointer overflow-hidden group flex flex-col justify-between transform hover:-translate-y-1"
                >
                  {/* Domain Illustration Header */}
                  <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <DomainIllustration domainId={cat.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Domain Number Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                      #{domainNumber}
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-xs">
                      {isArabic ? '6 مستويات' : '6 Levels'}
                    </div>

                    {/* Target Language Indicator */}
                    <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                      <span>{currentLangInfo?.flag}</span>
                      <span>{currentLangInfo?.code.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
                        {cat.title[lang] || cat.title['en']}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {cat.description[lang] || cat.description['en']}
                      </p>
                    </div>

                    {/* Bottom CTA & summary */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{isArabic ? '50 بطاقة / مستوى' : '50 cards / level'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>{isArabic ? 'استعراض المستويات' : 'View Levels'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Domain Drill-Down View */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setSelectedDomainId(null);
              setActiveLevelPreview(null);
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isArabic ? 'العودة إلى المجالات الـ 8' : 'Back to 8 Domains'}</span>
          </button>

          {/* Domain Detail Header with Illustration */}
          {activeCategory && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col md:flex-row items-stretch">
              <div className="md:w-72 h-48 md:h-auto shrink-0 relative bg-slate-100 dark:bg-slate-800">
                <DomainIllustration domainId={activeCategory.id} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                    {currentLangInfo?.flag} {currentLangInfo?.name} ({selectedLanguage.toUpperCase()})
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? '50 بطاقة لكل مستوى' : '50 Cards per level'}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {isArabic ? 'إجمالي 300 بطاقة' : '300 Total Cards'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeCategory.title[lang] || activeCategory.title['en']}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {activeCategory.description[lang] || activeCategory.description['en']}
                </p>
              </div>
            </div>
          )}

          {/* Levels Grid (A1, A2, B1, B2, C1, C2) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isArabic ? 'المستويات الدراسية الـ 6' : 'The 6 CEFR Learning Levels'}</span>
                <span className="text-xs font-normal text-slate-400">({isArabic ? 'اختر المستوى للبدء' : 'Select a level to study'})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CEFR_LEVELS.map((lvl) => {
                const deck50 = getDeckWith50Cards(selectedLanguage, selectedDomainId, lvl.level);
                const inLibrary = isDeckInLibrary(deck50.id);
                const isAdding = addingLevel === deck50.id;

                return (
                  <div
                    key={lvl.level}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-xs">
                          {lvl.level}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-xl border border-teal-200/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{isArabic ? '50 بطاقة معتمدة' : '50 Validated Cards'}</span>
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        {lvl.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {lvl.desc}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveLevelPreview({ level: lvl.level, deck: deck50 })}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title={isArabic ? 'معاينة الـ 50 بطاقة كاملة' : 'Preview all 50 cards'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'معاينة (50)' : 'Preview'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddLevelToLibrary(deck50)}
                          disabled={inLibrary || isAdding}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            inLibrary
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200/50 cursor-default'
                              : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                          title={isArabic ? 'إضافة 50 بطاقة إلى قسم تعلّمي' : 'Add 50 cards to library'}
                        >
                          {inLibrary ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{inLibrary ? (isArabic ? 'مُضاف' : 'Added') : (isArabic ? 'إضافة' : 'Add')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartStudyingDeck(deck50)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                          title={isArabic ? 'بدء جلسة المذاكرة الآن' : 'Start study session now'}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isArabic ? 'مذاكرة' : 'Study'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 50-Card Preview Modal */}
      {activeLevelPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-600 text-white">
                    {activeLevelPreview.level}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {activeCategory?.title[lang] || activeCategory?.title['en']}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {isArabic
                    ? `عرض كافة البطاقات الـ 50 المعتمدة باللغة ${currentLangInfo?.name || selectedLanguage.toUpperCase()}`
                    : `Showing all 50 validated cards for ${currentLangInfo?.name || selectedLanguage.toUpperCase()}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLevelPreview(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 50 Cards Scrollable List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {activeLevelPreview.deck.cards.map((c, i) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{c.term}</span>
                      {c.transliteration && (
                        <span className="text-[11px] text-slate-400 font-mono">({c.transliteration})</span>
                      )}
                    </div>
                    <AudioButton text={c.term} lang={selectedLanguage} size="sm" />
                  </div>

                  <p className="font-bold text-indigo-700 dark:text-indigo-400 pt-0.5">
                    {c.translations[profile?.preferredTranslationLanguage || 'en'] || c.translations['en'] || c.translations['ar']}
                  </p>

                  {c.exampleSentence && (
                    <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 space-y-0.5">
                      <p className="text-slate-700 dark:text-slate-300 italic font-medium">
                        "{c.exampleSentence}"
                      </p>
                      {c.exampleTranslations?.[profile?.preferredTranslationLanguage || 'en'] && (
                        <p className="text-[11px] text-slate-400">
                          {c.exampleTranslations[profile?.preferredTranslationLanguage || 'en']}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveLevelPreview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAddLevelToLibrary(activeLevelPreview.deck);
                    setActiveLevelPreview(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إضافة إلى تعلّمي' : 'Add to My Learning'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = activeLevelPreview.deck;
                    setActiveLevelPreview(null);
                    handleStartStudyingDeck(d);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isArabic ? 'بدء المذاكرة الآن' : 'Study Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
