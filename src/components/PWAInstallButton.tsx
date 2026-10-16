import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { useAuth } from '../context/AuthContext';

export const PWAInstallButton: React.FC<{ className?: string; variant?: 'button' | 'banner' | 'compact' }> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { profile } = useAuth();
  const isArabic = profile?.interfaceLanguage === 'ar';

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In browsers where beforeinstallprompt hasn't fired yet or isn't supported, show instructions
      setShowIOSGuide(true);
    }
  };

  const titleText = isArabic ? 'تثبيت التطبيق' : 'Install App';
  const descText = isArabic ? 'استخدم 7ifd كتطبيق مباشر على هاتفك وحاسوبك' : 'Use 7ifd directly on your phone and desktop';

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-xs transition-all ${className}`}
          title={titleText}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{titleText}</span>
        </button>
      ) : variant === 'banner' ? (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-700/50 shadow-md flex items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="7ifd Logo" className="w-10 h-10 rounded-xl shadow-xs shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">{titleText}</span>
              <span className="text-xs text-indigo-200/80">{descText}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تثبيت الآن' : 'Install Now'}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-xs transition-all ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{titleText}</span>
        </button>
      )}

      {/* Guide Dialog for iOS and Desktop */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="7ifd" className="w-8 h-8 rounded-lg" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isArabic ? 'تثبيت تطبيق 7ifd' : 'Install 7ifd App'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>{isArabic ? 'لتثبيت التطبيق على جهاز iPhone أو iPad:' : 'To install on iPhone or iPad:'}</p>
                <ol className="list-decimal list-inside space-y-1.5 font-medium">
                  <li>
                    {isArabic
                      ? 'اضغط على زر المشاركة (Share) أسفل متصفح Safari.'
                      : 'Tap the Share button in the Safari toolbar.'}
                  </li>
                  <li>
                    {isArabic
                      ? 'اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : 'Select "Add to Home Screen".'}
                  </li>
                  <li>
                    {isArabic
                      ? 'اضغط "إضافة" (Add) في الزاوية العلوية.'
                      : 'Tap "Add" in the top corner.'}
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  {isArabic
                    ? 'يمكنك تثبيت التطبيق من قائمة خيارات المتصفح (⋮) ثم النقر على "تثبيت 7ifd" أو "إضافة إلى الشاشة الرئيسية".'
                    : 'Open the browser menu (⋮) and select "Install 7ifd" or "Add to Home screen" to use the app offline.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              {isArabic ? 'حسناً، فهمت' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
