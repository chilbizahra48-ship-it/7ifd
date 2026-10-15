import React, { createContext, useContext, useEffect, useState } from 'react';
import { LanguageCode } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  interfaceLanguage: LanguageCode;
  setInterfaceLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('7ifd_theme') as ThemeMode) || 'light';
  });

  const [interfaceLanguage, setInterfaceLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('7ifd_interface_lang') as LanguageCode) || 'en';
  });

  const isRTL = interfaceLanguage === 'ar';

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    // Set language and text direction
    root.setAttribute('lang', interfaceLanguage);
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [interfaceLanguage, isRTL]);

  useEffect(() => {
    const updateTheme = () => {
      let resolved: 'light' | 'dark' = 'light';
      if (theme === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = prefersDark ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      setEffectiveTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();
    localStorage.setItem('7ifd_theme', theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', updateTheme);
      return () => media.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const setInterfaceLanguage = (lang: LanguageCode) => {
    setInterfaceLanguageState(lang);
    localStorage.setItem('7ifd_interface_lang', lang);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        interfaceLanguage,
        setInterfaceLanguage,
        isRTL,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
