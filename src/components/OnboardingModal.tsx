import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Globe, Target, Languages, Award, Flame, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTranslation } from '../i18n/translations';
import { CEFRLevel, CEFR_LEVELS, LanguageCode, SUPPORTED_LANGUAGES } from '../types';

export const OnboardingModal: React.FC = () => {
  const { profile, updateProfileSettings } = useAuth();
  const { setInterfaceLanguage } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [selectedInterfaceLang, setSelectedInterfaceLang] = useState<LanguageCode>('en');
  const [selectedTargetLang, setSelectedTargetLang] = useState<LanguageCode>('es');
  const [selectedTransLang, setSelectedTransLang] = useState<LanguageCode>('en');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('A1');
  const [selectedGoal, setSelectedGoal] = useState<number>(20);

  useEffect(() => {
    if (profile) {
      if (profile.interfaceLanguage) setSelectedInterfaceLang(profile.interfaceLanguage);
      if (profile.targetLanguage) setSelectedTargetLang(profile.targetLanguage);
      if (profile.preferredTranslationLanguage) setSelectedTransLang(profile.preferredTranslationLanguage);
      if (profile.currentLevel) setSelectedLevel(profile.currentLevel);
      if (profile.dailyGoalCards) setSelectedGoal(profile.dailyGoalCards);
    }
  }, [profile]);

  // If already completed or profile not loaded yet, don't show modal
  if (!profile || profile.onboardingCompleted) {
    return null;
  }

  const lang = selectedInterfaceLang;

  const handleInterfaceChange = (newLang: LanguageCode) => {
    setSelectedInterfaceLang(newLang);
    setInterfaceLanguage(newLang);
  };

  const handleFinish = async () => {
    await updateProfileSettings({
      interfaceLanguage: selectedInterfaceLang,
      targetLanguage: selectedTargetLang,
      preferredTranslationLanguage: selectedTransLang,
      currentLevel: selectedLevel,
      dailyGoalCards: selectedGoal,
      onboardingCompleted: true,
    });
  };

  const handleSkip = async () => {
    await updateProfileSettings({
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                7
              </span>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">7ifd</span>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {getTranslation('onboarding_skip_btn', lang)}
            </button>
          </div>

          <div className="flex items-center gap-1.5 w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  step >= i ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {getTranslation('onboarding_step_interface', lang)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Controls navigation, buttons, and system messages.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleInterfaceChange(item.code)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedInterfaceLang === item.code
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.flag}</span>
                    <span className="truncate">{item.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {getTranslation('onboarding_step_target', lang)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                The primary language you are seeking to acquire and memorize.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setSelectedTargetLang(item.code)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedTargetLang === item.code
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.flag}</span>
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Languages className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {getTranslation('onboarding_step_translation', lang)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                The language used for definitions, translations, and explanations.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setSelectedTransLang(item.code)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedTransLang === item.code
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.flag}</span>
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {getTranslation('onboarding_step_level', lang)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Select your self-assessed European Framework CEFR level.
              </p>
              <div className="space-y-2">
                {CEFR_LEVELS.map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSelectedLevel(item.level)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      selectedLevel === item.level
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-extrabold rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 mr-2">
                        {item.level}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    {selectedLevel === item.level && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <Flame className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {getTranslation('onboarding_step_goal', lang)}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                How many cards do you aim to review daily?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[10, 20, 30, 50].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedGoal === goal
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="block text-2xl font-black text-slate-900 dark:text-white">{goal}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">cards / day</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {getTranslation('onboarding_finish_btn', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
