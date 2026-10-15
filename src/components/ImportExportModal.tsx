import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Smartphone,
  ClipboardPaste,
  FileType,
} from 'lucide-react';
import { Card, Deck } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { getTranslation } from '../i18n/translations';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDeckId?: string;
  decks: Deck[];
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  defaultDeckId,
  decks,
}) => {
  const { profile } = useAuth();
  const { cards, importCardsToDeck } = useSync();
  const lang = profile?.interfaceLanguage || 'en';
  const isArabic = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
  const [selectedDeckId, setSelectedDeckId] = useState<string>(defaultDeckId || (decks[0]?.id ?? ''));

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDirectJsonImport, setIsDirectJsonImport] = useState(false);
  const [directJsonCards, setDirectJsonCards] = useState<any[]>([]);

  const [columnMapping, setColumnMapping] = useState<{
    term: string;
    translation: string;
    exampleSentence: string;
    exampleTranslation: string;
    pronunciation: string;
    transliteration: string;
    usageNote: string;
  }>({
    term: '',
    translation: '',
    exampleSentence: '',
    exampleTranslation: '',
    pronunciation: '',
    transliteration: '',
    usageNote: '',
  });

  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; rejected: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto detect columns for mapping
  const autoMapColumns = (cols: string[]) => {
    const mapping = {
      term: '',
      translation: '',
      exampleSentence: '',
      exampleTranslation: '',
      pronunciation: '',
      transliteration: '',
      usageNote: '',
    };

    cols.forEach((col) => {
      const lower = col.toLowerCase().trim().replace(/^\uFEFF/, '');
      if (
        lower === 'term' ||
        lower === 'front' ||
        lower === 'word' ||
        lower === 'target' ||
        lower === 'كلمة' ||
        lower === 'المصطلح'
      ) {
        mapping.term = col;
      } else if (
        lower === 'translation' ||
        lower === 'trans' ||
        lower === 'back' ||
        lower === 'meaning' ||
        lower === 'def' ||
        lower === 'ترجمة' ||
        lower === 'المعنى'
      ) {
        mapping.translation = col;
      } else if (lower.includes('example') && (lower.includes('trans') || lower.includes('meaning'))) {
        if (!mapping.exampleTranslation) mapping.exampleTranslation = col;
      } else if (lower.includes('example') || lower.includes('sentence') || lower.includes('مثال')) {
        if (!mapping.exampleSentence) mapping.exampleSentence = col;
      } else if (lower.includes('pronun') || lower.includes('ipa') || lower.includes('نطق')) {
        if (!mapping.pronunciation) mapping.pronunciation = col;
      } else if (lower.includes('roman') || lower.includes('translit') || lower.includes('pinyin') || lower.includes('حرفي')) {
        if (!mapping.transliteration) mapping.transliteration = col;
      } else if (lower.includes('note') || lower.includes('usage') || lower.includes('grammar') || lower.includes('ملاحظة')) {
        if (!mapping.usageNote) mapping.usageNote = col;
      }
    });

    // Fallbacks if not exact match
    if (!mapping.term) {
      const found = cols.find((c) => {
        const l = c.toLowerCase();
        return l.includes('term') || l.includes('front') || l.includes('word') || l.includes('target');
      });
      if (found) mapping.term = found;
      else if (cols[0]) mapping.term = cols[0];
    }

    if (!mapping.translation) {
      const found = cols.find((c) => {
        const l = c.toLowerCase();
        return (l.includes('trans') && !l.includes('lit')) || l.includes('back') || l.includes('mean');
      });
      if (found) mapping.translation = found;
      else if (cols[1]) mapping.translation = cols[1];
    }

    setColumnMapping(mapping);
  };

  // Parse raw text (used both for file content and pasted text)
  const parseRawContent = (text: string, filename?: string) => {
    setErrorMessage('');
    setImportResult(null);
    setIsDirectJsonImport(false);
    setDirectJsonCards([]);

    const cleanText = text.trim();
    if (!cleanText) {
      setErrorMessage(isArabic ? 'الملف أو النص فارغ' : 'The file or text appears to be empty.');
      return;
    }

    // 1. Try parsing as JSON first
    if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
      try {
        const content = JSON.parse(cleanText);

        // Check if 7ifd exported deck: { deck, cards: [...] }
        if (content && typeof content === 'object' && Array.isArray(content.cards) && content.cards.length > 0) {
          setIsDirectJsonImport(true);
          setDirectJsonCards(content.cards);
          setParsedRows(content.cards);
          setHeaders(['term', 'translation']);
          return;
        }

        // Check if raw cards array: [ { term, translation, ... } ]
        if (Array.isArray(content) && content.length > 0) {
          if (content[0]?.term && content[0]?.translation) {
            setIsDirectJsonImport(true);
            setDirectJsonCards(content);
            setParsedRows(content);
            setHeaders(['term', 'translation']);
            return;
          }

          // Generic JSON array of objects
          setParsedRows(content);
          const keys = Object.keys(content[0] || {});
          setHeaders(keys);
          autoMapColumns(keys);
          return;
        }

        // Check if simple dictionary object: { "word": "translation" }
        if (typeof content === 'object' && !Array.isArray(content)) {
          const entries = Object.entries(content);
          if (entries.length > 0 && typeof entries[0][1] === 'string') {
            const rowData = entries.map(([k, v]) => ({ term: k, translation: String(v) }));
            setIsDirectJsonImport(true);
            setDirectJsonCards(rowData);
            setParsedRows(rowData);
            setHeaders(['term', 'translation']);
            return;
          }
        }
      } catch {
        // Not JSON, fall through to Delimited/CSV parser
      }
    }

    // 2. Parse as CSV / Delimited using Papa Parse
    Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const firstRow = results.data[0] as Record<string, any>;
          const keys = Object.keys(firstRow).filter((k) => k && k.trim());

          // If header detection yielded multiple columns:
          if (keys.length >= 2) {
            setParsedRows(results.data);
            setHeaders(keys);
            autoMapColumns(keys);
            return;
          }
        }

        // 3. Fallback: Parse line-by-line format for mobile notes (e.g., "apple - تفاحة" or "hello\tمرحبا")
        const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const extracted: Array<{ term: string; translation: string }> = [];

        lines.forEach((line) => {
          let term = '';
          let translation = '';

          if (line.includes('\t')) {
            const parts = line.split('\t');
            term = parts[0]?.trim();
            translation = parts.slice(1).join('\t').trim();
          } else if (line.includes(' - ')) {
            const parts = line.split(' - ');
            term = parts[0]?.trim();
            translation = parts.slice(1).join(' - ').trim();
          } else if (line.includes(' : ') || line.includes(':')) {
            const parts = line.split(':');
            term = parts[0]?.trim();
            translation = parts.slice(1).join(':').trim();
          } else if (line.includes('=')) {
            const parts = line.split('=');
            term = parts[0]?.trim();
            translation = parts.slice(1).join('=').trim();
          } else if (line.includes(',')) {
            const parts = line.split(',');
            term = parts[0]?.trim();
            translation = parts.slice(1).join(',').trim();
          }

          if (term && translation) {
            extracted.push({ term, translation });
          }
        });

        if (extracted.length > 0) {
          setIsDirectJsonImport(true);
          setDirectJsonCards(extracted);
          setParsedRows(extracted);
          setHeaders(['term', 'translation']);
        } else {
          setErrorMessage(
            isArabic
              ? 'تعذر التعرف على البطاقات في الملف أو النص. تأكد من أن كل سطر يحتوي على الكلمة وترجمتها مفصولتين بـ (-) أو (:) أو فاصلة.'
              : 'Could not detect cards in the file. Ensure each row contains a word and translation separated by comma, tab, or dash (-).'
          );
        }
      },
      error: (err: any) => {
        setErrorMessage(isArabic ? `فشل تحليل الملف: ${err.message}` : `Failed to parse file: ${err.message}`);
      },
    });
  };

  // Handle file selection from phone or computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseRawContent(content, file.name);
    };
    reader.onerror = () => {
      setErrorMessage(
        isArabic ? 'حدث خطأ أثناء قراءة الملف من الهاتف.' : 'Error reading the file from device storage.'
      );
    };
    reader.readAsText(file, 'utf-8');
  };

  // Execute Import
  const executeImport = async () => {
    if (!selectedDeckId) {
      setErrorMessage(isArabic ? 'يرجى اختيار الحزمة المستهدفة أولاً.' : 'Please select a destination deck.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Existing terms in this deck for duplicate checking
      const existingTerms = new Set(
        cards.filter((c) => c.deckId === selectedDeckId).map((c) => c.term.trim().toLowerCase().normalize('NFC'))
      );

      const validCards: Array<{
        term: string;
        translation: string;
        exampleSentence?: string;
        exampleTranslation?: string;
        pronunciation?: string;
        transliteration?: string;
        usageNote?: string;
      }> = [];

      let skippedCount = 0;
      let rejectedCount = 0;

      if (isDirectJsonImport && directJsonCards.length > 0) {
        // Direct structured cards (from 7ifd export, JSON array, or parsed lines)
        directJsonCards.forEach((c) => {
          const termVal = c.term?.toString().trim();
          const transVal = c.translation?.toString().trim();

          if (!termVal || !transVal) {
            rejectedCount++;
            return;
          }

          const norm = termVal.toLowerCase().normalize('NFC');
          if (skipDuplicates && existingTerms.has(norm)) {
            skippedCount++;
            return;
          }

          existingTerms.add(norm);

          validCards.push({
            term: termVal,
            translation: transVal,
            exampleSentence: c.exampleSentence ? String(c.exampleSentence).trim() : undefined,
            exampleTranslation: c.exampleTranslation ? String(c.exampleTranslation).trim() : undefined,
            pronunciation: c.pronunciation ? String(c.pronunciation).trim() : undefined,
            transliteration: c.transliteration ? String(c.transliteration).trim() : undefined,
            usageNote: c.usageNote ? String(c.usageNote).trim() : undefined,
          });
        });
      } else {
        // Custom column mapped rows
        if (!columnMapping.term || !columnMapping.translation) {
          setErrorMessage(
            isArabic
              ? 'يرجى تحديد عمود الكلمة وعمود الترجمة للمتابعة.'
              : 'Please map both the Front (Word) and Back (Translation) columns.'
          );
          setIsProcessing(false);
          return;
        }

        parsedRows.forEach((row) => {
          const termVal = row[columnMapping.term]?.toString().trim();
          const transVal = row[columnMapping.translation]?.toString().trim();

          if (!termVal || !transVal) {
            rejectedCount++;
            return;
          }

          const norm = termVal.toLowerCase().normalize('NFC');
          if (skipDuplicates && existingTerms.has(norm)) {
            skippedCount++;
            return;
          }

          existingTerms.add(norm);

          validCards.push({
            term: termVal,
            translation: transVal,
            exampleSentence: columnMapping.exampleSentence
              ? row[columnMapping.exampleSentence]?.toString().trim()
              : undefined,
            exampleTranslation: columnMapping.exampleTranslation
              ? row[columnMapping.exampleTranslation]?.toString().trim()
              : undefined,
            pronunciation: columnMapping.pronunciation
              ? row[columnMapping.pronunciation]?.toString().trim()
              : undefined,
            transliteration: columnMapping.transliteration
              ? row[columnMapping.transliteration]?.toString().trim()
              : undefined,
            usageNote: columnMapping.usageNote ? row[columnMapping.usageNote]?.toString().trim() : undefined,
          });
        });
      }

      if (validCards.length > 0) {
        await importCardsToDeck(selectedDeckId, validCards);
      }

      setImportResult({
        imported: validCards.length,
        skipped: skippedCount,
        rejected: rejectedCount,
      });
    } catch (err: any) {
      setErrorMessage(
        isArabic ? `فشل الاستيراد: ${err.message || 'خطأ غير معروف'}` : `Import failed: ${err.message || 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Export Handling with Mobile Safe Download & Web Share ---
  const getDeckExportData = (format: 'json' | 'csv' | 'tsv') => {
    const deck = decks.find((d) => d.id === selectedDeckId);
    if (!deck) return null;

    const deckCards = cards.filter((c) => c.deckId === selectedDeckId);
    const sanitizedTitle = deck.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\u4e00-\u9fa5]/g, '_');
    const filename = `${sanitizedTitle}_${deck.targetLanguage}_cards.${format}`;

    if (format === 'json') {
      const content = JSON.stringify(
        {
          deck,
          cards: deckCards,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );
      return { content, filename, mimeType: 'application/json;charset=utf-8' };
    } else {
      const rows = deckCards.map((c) => ({
        Term: c.term,
        Translation: c.translation,
        Pronunciation: c.pronunciation || '',
        Transliteration: c.transliteration || '',
        Example_Sentence: c.exampleSentence || '',
        Example_Translation: c.exampleTranslation || '',
        Usage_Note: c.usageNote || '',
        Tags: c.tags.join('; '),
      }));

      const delimiter = format === 'tsv' ? '\t' : ',';
      const csvStr = Papa.unparse(rows, { delimiter });
      // Prepend UTF-8 BOM so Excel and mobile spreadsheet viewers render Arabic & international characters properly
      const content = '\uFEFF' + csvStr;
      return {
        content,
        filename,
        mimeType: format === 'tsv' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8',
      };
    }
  };

  const handleExportDownload = (format: 'json' | 'csv' | 'tsv') => {
    const data = getDeckExportData(format);
    if (!data) return;

    const blob = new Blob([data.content], { type: data.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // CRITICAL for mobile (iOS Safari & Android Chrome):
    // Do not revoke synchronously, keep object URL alive for mobile downloads
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  };

  // Direct share on phone (iOS Files, Android Drive, WhatsApp, etc.)
  const handleMobileShare = async (format: 'json' | 'csv') => {
    const data = getDeckExportData(format);
    if (!data) return;

    try {
      if (navigator.share) {
        // Try file sharing if supported
        try {
          const blob = new Blob([data.content], { type: data.mimeType });
          const file = new File([blob], data.filename, { type: data.mimeType });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: data.filename,
              text: isArabic ? 'ملف بطاقات 7ifd' : '7ifd cards export file',
            });
            return;
          }
        } catch {
          // Fall back to text share
        }

        // Fallback text share
        await navigator.share({
          title: data.filename,
          text: data.content.slice(0, 5000), // First 5000 chars for text sharing
        });
        setShareNotice(isArabic ? 'تمت المشاركة بنجاح' : 'Shared successfully');
        setTimeout(() => setShareNotice(null), 3000);
      } else {
        handleExportDownload(format);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleExportDownload(format);
      }
    }
  };

  const handleCopyToClipboard = (format: 'json' | 'csv') => {
    const data = getDeckExportData(format);
    if (!data) return;

    navigator.clipboard.writeText(data.content);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'import'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تحميل واستيراد بطاقات' : getTranslation('action_import', lang)}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'export'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تنزيل وتصدير' : getTranslation('action_export', lang)}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {shareNotice && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{shareNotice}</span>
            </div>
          )}

          {/* Deck Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isArabic ? 'الحزمة المستهدفة لإضافة البطاقات' : 'Destination Deck'}
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.targetLanguage.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'import' ? (
            <div className="space-y-4">
              {/* Import method switcher: File from Phone vs Paste Direct Text */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setImportMode('file');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    importMode === 'file'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'ملف من الهاتف / الجهاز' : 'File from Device'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportMode('paste');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    importMode === 'paste'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'لصق نص مباشر' : 'Paste Direct Text'}</span>
                </button>
              </div>

              {/* Mode 1: File Upload optimized for mobile phones */}
              {importMode === 'file' && (
                <div>
                  {!importFile ? (
                    <div className="border-2 border-dashed border-indigo-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-colors bg-indigo-50/20 dark:bg-slate-800/40 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mb-1">
                        {isArabic ? 'تحميل ملف البطاقات من الهاتف' : 'Upload Card File from Phone'}
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 max-w-xs mb-4">
                        {isArabic
                          ? 'يدعم ملفات CSV و TSV و TXT و JSON (مع دعم كامل للغة العربية)'
                          : 'Supports CSV, TSV, TXT, and JSON files with full UTF-8 Unicode'}
                      </p>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isArabic ? 'اضغط لاختيار ملف من هاتفك' : 'Tap to Choose File from Phone'}</span>
                      </button>

                      {/* Phone compatible file input: accepts extensions AND MIME types */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.tsv,.txt,.json,.tsv,text/csv,text/plain,text/tab-separated-values,application/json,application/octet-stream,text/*,*/*"
                        onChange={handleFileUpload}
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = '';
                        }}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200 truncate font-semibold">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate">{importFile.name}</span>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold shrink-0">
                          ({parsedRows.length} {isArabic ? 'بطاقة تم التعرف عليها' : 'cards detected'})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImportFile(null);
                          setParsedRows([]);
                          setIsDirectJsonImport(false);
                          setDirectJsonCards([]);
                          setImportResult(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline ml-2 shrink-0"
                      >
                        {isArabic ? 'تغيير' : 'Change'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Paste Direct Text */}
              {importMode === 'paste' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isArabic ? 'الصق نص البطاقات هنا:' : 'Paste cards text here:'}
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {isArabic
                        ? 'يمكنك لصق قائمة مثل (apple - تفاحة) أو نص CSV أو جدول منسيخ من الملاحظات'
                        : 'Paste text from Notes or WhatsApp (e.g., "apple - تفاحة" or CSV)'}
                    </p>
                  </div>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={
                      isArabic
                        ? 'apple - تفاحة\nwater - ماء\nbook - كتاب'
                        : 'hello - مرحبا\nfriend - صديق\nwelcome - أهلاً'
                    }
                    className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => parseRawContent(pastedText, 'pasted-text.txt')}
                    disabled={!pastedText.trim()}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {isArabic ? 'معاينة وتحليل النص' : 'Analyze & Preview Cards'}
                  </button>
                </div>
              )}

              {/* Preview & Column Mapping */}
              {parsedRows.length > 0 && !importResult && (
                <div className="space-y-3 pt-2">
                  {isDirectJsonImport ? (
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                      <span>
                        {isArabic
                          ? `تم تجهيز ${parsedRows.length} بطاقة بنجاح مع كافة تفاصيلها!`
                          : `Ready to import ${parsedRows.length} cards with complete details!`}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                        {isArabic ? 'مطابقة الأعمدة' : 'Column Mapping'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            {isArabic ? 'الكلمة (الوجه الأمامي) *' : 'Front / Target Word *'}
                          </label>
                          <select
                            value={columnMapping.term}
                            onChange={(e) => setColumnMapping({ ...columnMapping, term: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                          >
                            <option value="">{isArabic ? 'اختر العمود...' : 'Select column...'}</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            {isArabic ? 'الترجمة (الوجه الخلفي) *' : 'Back / Meaning *'}
                          </label>
                          <select
                            value={columnMapping.translation}
                            onChange={(e) => setColumnMapping({ ...columnMapping, translation: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                          >
                            <option value="">{isArabic ? 'اختر العمود...' : 'Select column...'}</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            {isArabic ? 'جملة مثال (اختياري)' : 'Example Sentence'}
                          </label>
                          <select
                            value={columnMapping.exampleSentence}
                            onChange={(e) => setColumnMapping({ ...columnMapping, exampleSentence: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                          >
                            <option value="">(None)</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            {isArabic ? 'ترجمة المثال (اختياري)' : 'Example Translation'}
                          </label>
                          <select
                            value={columnMapping.exampleTranslation}
                            onChange={(e) => setColumnMapping({ ...columnMapping, exampleTranslation: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                          >
                            <option value="">(None)</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isArabic ? 'تخطي الكلمات المكررة الموجودة مسبقاً في هذه الحزمة' : 'Skip duplicate words already present in this deck'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={executeImport}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>
                      {isArabic
                        ? `بدء استيراد ${parsedRows.length} بطاقة إلى الحزمة`
                        : `Start Importing ${parsedRows.length} Cards`}
                    </span>
                  </button>
                </div>
              )}

              {/* Import summary report */}
              {importResult && (
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isArabic ? 'تقرير نجاح الاستيراد' : 'Import Summary'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                      <span className="block text-lg font-black text-teal-600">{importResult.imported}</span>
                      <span className="text-[10px] text-slate-500">{isArabic ? 'تم استيرادها' : 'Imported'}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                      <span className="block text-lg font-black text-amber-600">{importResult.skipped}</span>
                      <span className="text-[10px] text-slate-500">{isArabic ? 'مكررة وتم تخطيها' : 'Duplicates Skipped'}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                      <span className="block text-lg font-black text-rose-600">{importResult.rejected}</span>
                      <span className="text-[10px] text-slate-500">{isArabic ? 'أسطر غير صالحة' : 'Invalid Rows'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Export / Download tab */
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isArabic
                  ? 'قم بتنزيل بطاقات الحزمة إلى هاتفك أو مشاركتها مباشرة. يتم الحفاظ على ترميز الحروف العربية بالكامل.'
                  : 'Export all cards from the selected deck. Unicode characters are preserved with UTF-8 byte-order marks.'}
              </p>

              {/* Quick Mobile Share Button if on phone */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-bold text-xs">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>{isArabic ? 'حفظ مباشر في الهاتف أو مشاركة' : 'Save to Phone or Share'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                  {isArabic
                    ? 'يمكنك حفظ الملف في تطبيق الملفات بالهاتف، أو إرساله عبر واتساب أو درايف'
                    : 'Save directly to phone Files app, or share via WhatsApp or Google Drive'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMobileShare('csv')}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'مشاركة CSV (إكسل)' : 'Share CSV'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileShare('json')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'مشاركة JSON' : 'Share JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Download options */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isArabic ? 'أو تنزيل الملف مباشرة:' : 'Or download file directly:'}
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleExportDownload('csv')}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/60 text-center transition-all group active:scale-95"
                  >
                    <span className="block text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600">
                      CSV
                    </span>
                    <span className="text-[10px] text-slate-400">Excel / Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportDownload('json')}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/60 text-center transition-all group active:scale-95"
                  >
                    <span className="block text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600">
                      JSON
                    </span>
                    <span className="text-[10px] text-slate-400">{isArabic ? 'بيانات كاملة' : 'Full Data'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportDownload('tsv')}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/60 text-center transition-all group active:scale-95"
                  >
                    <span className="block text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600">
                      TSV
                    </span>
                    <span className="text-[10px] text-slate-400">Tab Separated</span>
                  </button>
                </div>
              </div>

              {/* Copy cards to clipboard */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">{isArabic ? 'نسخ محتوى البطاقات:' : 'Copy cards text:'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard('csv')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedFormat === 'csv' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFormat === 'csv' ? (isArabic ? 'تم النسخ' : 'Copied!') : 'CSV'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard('json')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFormat === 'json' ? (isArabic ? 'تم النسخ' : 'Copied!') : 'JSON'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {getTranslation('action_close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
