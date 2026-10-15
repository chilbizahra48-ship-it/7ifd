import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';

export const SyncStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { syncStatus, isOnline, syncNow } = useSync();
  const { profile } = useAuth();
  const lang = profile?.interfaceLanguage || 'en';

  const getStatusConfig = () => {
    if (!isOnline || syncStatus === 'offline') {
      return {
        icon: <CloudOff className="w-3.5 h-3.5 text-amber-500" />,
        text: getTranslation('sync_offline', lang),
        bg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
        clickable: false,
      };
    }
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />,
          text: getTranslation('sync_syncing', lang),
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
          clickable: false,
        };
      case 'pending':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-blue-500" />,
          text: getTranslation('sync_pending', lang),
          bg: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
          clickable: true,
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
          text: getTranslation('sync_error', lang),
          bg: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer',
          clickable: true,
        };
      case 'synced':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
          text: getTranslation('sync_synced', lang),
          bg: 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
          clickable: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <button
      type="button"
      onClick={config.clickable ? () => syncNow() : undefined}
      disabled={!config.clickable}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${config.bg} ${className}`}
      title={config.clickable ? 'Click to retry synchronization' : undefined}
    >
      {config.icon}
      <span>{config.text}</span>
    </button>
  );
};
