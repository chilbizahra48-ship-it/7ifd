import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { LanguageCode } from '../types';

interface AudioButtonProps {
  text: string;
  lang: LanguageCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LANG_BCP47: Record<LanguageCode, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  ar: 'ar-SA',
  pt: 'pt-BR',
  'zh-CN': 'zh-CN',
  th: 'th-TH',
  hi: 'hi-IN',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export const AudioButton: React.FC<AudioButtonProps> = ({ text, lang, className = '', size = 'md' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVoiceError, setHasVoiceError] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setHasVoiceError(true);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      const targetBcp = LANG_BCP47[lang] || 'en-US';
      utterance.lang = targetBcp;

      // Select voice matching language if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetBcp.toLowerCase().slice(0, 2)));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setHasVoiceError(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setHasVoiceError(true);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setHasVoiceError(true);
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isPlaying}
      title={hasVoiceError ? 'Audio unavailable for this voice in your browser' : 'Pronounce expression'}
      aria-label={`Pronounce ${text}`}
      className={`inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        hasVoiceError
          ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
          : isPlaying
          ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 animate-pulse'
          : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <Loader2 size={iconSizes[size]} className="animate-spin text-indigo-600 dark:text-indigo-400" />
      ) : hasVoiceError ? (
        <VolumeX size={iconSizes[size]} />
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
    </button>
  );
};
