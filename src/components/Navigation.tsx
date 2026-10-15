import React from 'react';
import { BookOpen, Compass, User as UserIcon, LogIn, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTranslation } from '../i18n/translations';
import { SyncStatusBadge } from './SyncStatusBadge';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'my-learning' | 'explore' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, onOpenAuth }) => {
  const { user, profile } = useAuth();
  const { theme, setTheme, isRTL } = useTheme();
  const lang = profile?.interfaceLanguage || 'en';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'my-learning',
      label: getTranslation('nav_my_learning', lang),
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'explore',
      label: getTranslation('nav_explore', lang),
      icon: <Compass className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'profile',
      label: getTranslation('nav_profile', lang),
      icon: <UserIcon className="w-5 h-5 shrink-0" />,
    },
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <>
      {/* Desktop Sidebar (approx 240px) */}
      <aside
        className={`hidden md:flex flex-col w-60 shrink-0 border-r dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 transition-colors z-20 ${
          isRTL ? 'border-r-0 border-l' : ''
        }`}
      >
        {/* Brand Header with Official Site Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt="7ifd Logo"
              className="w-10 h-10 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 shrink-0 object-contain"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">7ifd</span>
              <span className="text-[10px] block font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Spaced Repetition
              </span>
            </div>
          </div>
        </div>

        {/* Sync status indicator */}
        <div className="px-4 py-2">
          <SyncStatusBadge className="w-full justify-center" />
        </div>

        {/* PWA Install Button in Desktop Sidebar */}
        <div className="px-3 pb-2">
          <PWAInstallButton variant="compact" className="w-full justify-center" />
        </div>

        {/* 3 Primary Navigation Sections */}
        <nav className="flex-1 px-3 py-2 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer controls: theme switch & auth status */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {getTranslation('theme_label', lang)}
            </span>
            <button
              type="button"
              onClick={cycleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Current: ${theme}. Click to change.`}
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Monitor className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {!user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{getTranslation('nav_sign_in', lang)}</span>
            </button>
          ) : (
            <div
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {profile?.displayName || user.email}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 truncate">
                  {user.email ? 'Connected' : 'Local account'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (3 Primary Destinations) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around safe-area-bottom"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
