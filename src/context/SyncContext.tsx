import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/errors';
import { localDB, SyncQueueItem } from '../lib/storage/indexedDb';
import { calculateNextSRS, resetCardSRS, INITIAL_SRS_STATE } from '../lib/srs/sm2';
import { calculateStudyStats } from '../lib/srs/stats';
import { Card, Deck, ReviewRating, StudyEvent, StudyStats, SyncStatus } from '../types';
import { useAuth } from './AuthContext';
import { BundledDeck } from '../data/contentPacks';

interface SyncContextType {
  decks: Deck[];
  cards: Card[];
  studyEvents: StudyEvent[];
  stats: StudyStats;
  syncStatus: SyncStatus;
  isOnline: boolean;
  createDeck: (deckData: Omit<Deck, 'id' | 'ownerId' | 'cardCount' | 'createdAt' | 'updatedAt'>) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  duplicateDeck: (id: string) => Promise<Deck>;
  createCard: (cardData: Omit<Card, 'id' | 'ownerId' | 'srsState' | 'createdAt' | 'updatedAt'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reviewCard: (cardId: string, rating: ReviewRating, durationMs?: number) => Promise<void>;
  resetDeckSRS: (deckId: string) => Promise<void>;
  copyExploreDeckToMyLearning: (bundledDeck: BundledDeck) => Promise<Deck>;
  importCardsToDeck: (deckId: string, parsedCards: Array<{ term: string; translation: string; exampleSentence?: string; exampleTranslation?: string; pronunciation?: string; transliteration?: string; usageNote?: string; tags?: string[] }>) => Promise<number>;
  syncNow: () => Promise<void>;
  exportDataBackup: () => Promise<string>;
  restoreDataBackup: (jsonString: string) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const ownerId = user ? user.uid : (profile?.id || 'guest');

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('pending');
      syncNow();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user data from local IndexedDB first, then merge from Firestore if online
  const loadData = useCallback(async () => {
    if (!ownerId) return;

    try {
      // 1. Load from IndexedDB
      const localDecks = await localDB.getDecks(ownerId);
      const localCards = await localDB.getAllUserCards(ownerId);
      const localEvents = await localDB.getStudyEvents(ownerId);

      setDecks(localDecks);
      setCards(localCards);
      setStudyEvents(localEvents);

      // 2. If authenticated & online, fetch and reconcile from Firestore
      if (user && isOnline) {
        setSyncStatus('syncing');
        try {
          // Fetch Decks
          const decksQuery = query(collection(db, 'decks'), where('ownerId', '==', user.uid));
          const deckSnap = await getDocs(decksQuery);
          const cloudDecks: Deck[] = [];

          deckSnap.forEach((dDoc) => {
            cloudDecks.push(dDoc.data() as Deck);
          });

          // Fetch all cards belonging to user's decks
          const cloudCards: Card[] = [];
          for (const d of cloudDecks) {
            const cardsRef = collection(db, 'decks', d.id, 'cards');
            const cardSnap = await getDocs(cardsRef);
            cardSnap.forEach((cDoc) => {
              cloudCards.push(cDoc.data() as Card);
            });
          }

          // Fetch Study Events
          const eventsRef = collection(db, 'users', user.uid, 'studyEvents');
          const eventSnap = await getDocs(eventsRef);
          const cloudEvents: StudyEvent[] = [];
          eventSnap.forEach((eDoc) => {
            cloudEvents.push(eDoc.data() as StudyEvent);
          });

          // Merge & save to localDB (Cloud is authoritative for existing documents)
          for (const d of cloudDecks) {
            await localDB.saveDeck(d);
          }
          if (cloudCards.length > 0) {
            await localDB.saveCardsBatch(cloudCards);
          }
          for (const ev of cloudEvents) {
            await localDB.saveStudyEvent(ev);
          }

          // Reload merged set from IndexedDB
          const finalDecks = await localDB.getDecks(ownerId);
          const finalCards = await localDB.getAllUserCards(ownerId);
          const finalEvents = await localDB.getStudyEvents(ownerId);

          setDecks(finalDecks);
          setCards(finalCards);
          setStudyEvents(finalEvents);
          setSyncStatus('synced');
        } catch (cloudErr) {
          console.warn('Could not sync with Firestore, operating on local IndexedDB:', cloudErr);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus(isOnline ? 'synced' : 'offline');
      }
    } catch (err) {
      console.error('Failed to load local data:', err);
      setSyncStatus('error');
    }
  }, [ownerId, user, isOnline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Push pending mutations to Cloud
  const syncNow = useCallback(async () => {
    if (!user || !isOnline) {
      setSyncStatus(isOnline ? 'synced' : 'offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const queue = await localDB.getSyncQueue();
      for (const item of queue) {
        if (item.type === 'deck') {
          if (item.action === 'create' || item.action === 'update') {
            await setDoc(doc(db, 'decks', item.data.id), item.data);
          } else if (item.action === 'delete') {
            await deleteDoc(doc(db, 'decks', item.data.id));
          }
        } else if (item.type === 'card') {
          if (item.action === 'create' || item.action === 'update') {
            await setDoc(doc(db, 'decks', item.data.deckId, 'cards', item.data.id), item.data);
          } else if (item.action === 'delete') {
            await deleteDoc(doc(db, 'decks', item.data.deckId, 'cards', item.data.id));
          }
        } else if (item.type === 'study_event') {
          if (item.action === 'create') {
            await setDoc(doc(db, 'users', user.uid, 'studyEvents', item.data.id), item.data);
          }
        }
        await localDB.removeFromSyncQueue(item.id);
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed flushing sync queue:', err);
      setSyncStatus('error');
    }
  }, [user, isOnline]);

  // Compute real statistics
  const stats = useMemo(() => {
    return calculateStudyStats(cards, studyEvents, profile?.dailyGoalCards || 20, profile?.timeZone);
  }, [cards, studyEvents, profile]);

  // --- Deck operations ---
  const createDeck = async (
    deckData: Omit<Deck, 'id' | 'ownerId' | 'cardCount' | 'createdAt' | 'updatedAt'>
  ): Promise<Deck> => {
    const id = 'deck_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    const now = new Date().toISOString();
    const newDeck: Deck = {
      ...deckData,
      id,
      ownerId,
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Save locally
    await localDB.saveDeck(newDeck);
    setDecks((prev) => [newDeck, ...prev]);

    // Enqueue or send to cloud
    if (user && isOnline) {
      try {
        await setDoc(doc(db, 'decks', id), newDeck);
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_' + id,
          type: 'deck',
          action: 'create',
          data: newDeck,
          timestamp: now,
        });
        setSyncStatus('pending');
      }
    } else if (user) {
      await localDB.addToSyncQueue({
        id: 'sync_' + id,
        type: 'deck',
        action: 'create',
        data: newDeck,
        timestamp: now,
      });
      setSyncStatus('pending');
    }

    return newDeck;
  };

  const updateDeck = async (id: string, updates: Partial<Deck>): Promise<void> => {
    const existing = decks.find((d) => d.id === id);
    if (!existing) return;

    const updated: Deck = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await localDB.saveDeck(updated);
    setDecks((prev) => prev.map((d) => (d.id === id ? updated : d)));

    if (user && isOnline) {
      try {
        await setDoc(doc(db, 'decks', id), updated);
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_up_' + id + '_' + Date.now(),
          type: 'deck',
          action: 'update',
          data: updated,
          timestamp: updated.updatedAt,
        });
        setSyncStatus('pending');
      }
    }
  };

  const deleteDeck = async (id: string): Promise<void> => {
    await localDB.deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setCards((prev) => prev.filter((c) => c.deckId !== id));

    if (user && isOnline) {
      try {
        await deleteDoc(doc(db, 'decks', id));
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_del_' + id,
          type: 'deck',
          action: 'delete',
          data: { id },
          timestamp: new Date().toISOString(),
        });
        setSyncStatus('pending');
      }
    }
  };

  const duplicateDeck = async (id: string): Promise<Deck> => {
    const existing = decks.find((d) => d.id === id);
    if (!existing) throw new Error('Deck not found');

    const newDeck = await createDeck({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      targetLanguage: existing.targetLanguage,
      categoryId: existing.categoryId,
      level: existing.level,
      isPublic: false,
    });

    // Copy cards
    const deckCards = cards.filter((c) => c.deckId === id);
    for (const c of deckCards) {
      await createCard({
        deckId: newDeck.id,
        term: c.term,
        translation: c.translation,
        translations: c.translations,
        pronunciation: c.pronunciation,
        transliteration: c.transliteration,
        exampleSentence: c.exampleSentence,
        exampleTranslation: c.exampleTranslation,
        exampleTranslations: c.exampleTranslations,
        usageNote: c.usageNote,
        tags: c.tags,
      });
    }

    return newDeck;
  };

  // --- Card operations ---
  const createCard = async (
    cardData: Omit<Card, 'id' | 'ownerId' | 'srsState' | 'createdAt' | 'updatedAt'>
  ): Promise<Card> => {
    const id = 'card_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    const now = new Date().toISOString();
    const newCard: Card = {
      ...cardData,
      id,
      ownerId,
      srsState: { ...INITIAL_SRS_STATE, nextDueAt: now },
      createdAt: now,
      updatedAt: now,
    };

    await localDB.saveCard(newCard);
    setCards((prev) => [...prev, newCard]);

    // Update parent deck card count
    const parentDeck = decks.find((d) => d.id === cardData.deckId);
    if (parentDeck) {
      await updateDeck(parentDeck.id, { cardCount: (parentDeck.cardCount || 0) + 1 });
    }

    if (user && isOnline) {
      try {
        await setDoc(doc(db, 'decks', cardData.deckId, 'cards', id), newCard);
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_card_' + id,
          type: 'card',
          action: 'create',
          data: newCard,
          timestamp: now,
        });
        setSyncStatus('pending');
      }
    }

    return newCard;
  };

  const updateCard = async (id: string, updates: Partial<Card>): Promise<void> => {
    const existing = cards.find((c) => c.id === id);
    if (!existing) return;

    const updated: Card = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await localDB.saveCard(updated);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));

    if (user && isOnline) {
      try {
        await setDoc(doc(db, 'decks', existing.deckId, 'cards', id), updated);
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_card_up_' + id + '_' + Date.now(),
          type: 'card',
          action: 'update',
          data: updated,
          timestamp: updated.updatedAt,
        });
        setSyncStatus('pending');
      }
    }
  };

  const deleteCard = async (id: string): Promise<void> => {
    const existing = cards.find((c) => c.id === id);
    if (!existing) return;

    await localDB.deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));

    const parentDeck = decks.find((d) => d.id === existing.deckId);
    if (parentDeck) {
      await updateDeck(parentDeck.id, { cardCount: Math.max(0, (parentDeck.cardCount || 1) - 1) });
    }

    if (user && isOnline) {
      try {
        await deleteDoc(doc(db, 'decks', existing.deckId, 'cards', id));
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_card_del_' + id,
          type: 'card',
          action: 'delete',
          data: { id, deckId: existing.deckId },
          timestamp: new Date().toISOString(),
        });
        setSyncStatus('pending');
      }
    }
  };

  // --- Review study event ---
  const reviewCard = async (cardId: string, rating: ReviewRating, durationMs: number = 3000): Promise<void> => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const now = new Date();
    const newSRS = calculateNextSRS(card.srsState || INITIAL_SRS_STATE, rating, now);
    const updatedCard: Card = {
      ...card,
      srsState: newSRS,
      updatedAt: now.toISOString(),
    };

    const eventId = 'ev_' + card.id + '_' + now.getTime();
    const event: StudyEvent = {
      id: eventId,
      userId: ownerId,
      deckId: card.deckId,
      cardId: card.id,
      rating,
      reviewTimestamp: now.toISOString(),
      interval: newSRS.interval,
      easeFactor: newSRS.easeFactor,
      durationMs,
    };

    // Save locally
    await localDB.saveCard(updatedCard);
    await localDB.saveStudyEvent(event);

    setCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
    setStudyEvents((prev) => [...prev, event]);

    // Send to cloud or queue
    if (user && isOnline) {
      try {
        await setDoc(doc(db, 'decks', card.deckId, 'cards', card.id), updatedCard);
        await setDoc(doc(db, 'users', user.uid, 'studyEvents', eventId), event);
      } catch (err) {
        await localDB.addToSyncQueue({
          id: 'sync_ev_' + eventId,
          type: 'study_event',
          action: 'create',
          data: event,
          timestamp: now.toISOString(),
        });
        await localDB.addToSyncQueue({
          id: 'sync_card_srs_' + card.id + '_' + Date.now(),
          type: 'card',
          action: 'update',
          data: updatedCard,
          timestamp: now.toISOString(),
        });
        setSyncStatus('pending');
      }
    }
  };

  const resetDeckSRS = async (deckId: string): Promise<void> => {
    const deckCards = cards.filter((c) => c.deckId === deckId);
    const now = new Date().toISOString();

    const resetList = deckCards.map((c) => ({
      ...c,
      srsState: resetCardSRS(),
      updatedAt: now,
    }));

    await localDB.saveCardsBatch(resetList);
    setCards((prev) => prev.map((c) => (c.deckId === deckId ? { ...c, srsState: resetCardSRS(), updatedAt: now } : c)));

    if (user && isOnline) {
      try {
        const batch = writeBatch(db);
        resetList.forEach((c) => {
          batch.set(doc(db, 'decks', deckId, 'cards', c.id), c);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Could not reset SRS on cloud in batch:', err);
      }
    }
  };

  // --- Explore to My Learning copy ---
  const copyExploreDeckToMyLearning = async (bundledDeck: BundledDeck): Promise<Deck> => {
    const preferredLang = profile?.interfaceLanguage || 'en';
    const localizedTitle = bundledDeck.title[preferredLang] || bundledDeck.title['en'];
    const localizedDesc = bundledDeck.description[preferredLang] || bundledDeck.description['en'];

    const newDeck = await createDeck({
      title: localizedTitle,
      description: localizedDesc,
      targetLanguage: bundledDeck.targetLanguage,
      categoryId: bundledDeck.categoryId,
      level: bundledDeck.level,
      isPublic: false,
    });

    const now = new Date().toISOString();
    const batchCards: Card[] = bundledDeck.cards.map((bc, idx) => ({
      id: 'card_exp_' + newDeck.id + '_' + idx,
      deckId: newDeck.id,
      ownerId,
      term: bc.term,
      translation: bc.translations[profile?.preferredTranslationLanguage || 'en'] || bc.translations['en'] || '',
      translations: bc.translations,
      pronunciation: bc.pronunciation,
      transliteration: bc.transliteration,
      exampleSentence: bc.exampleSentence,
      exampleTranslation:
        bc.exampleTranslations[profile?.preferredTranslationLanguage || 'en'] || bc.exampleTranslations['en'] || '',
      exampleTranslations: bc.exampleTranslations,
      usageNote: bc.usageNote,
      tags: bc.tags,
      srsState: { ...INITIAL_SRS_STATE, nextDueAt: now },
      createdAt: now,
      updatedAt: now,
    }));

    await localDB.saveCardsBatch(batchCards);
    setCards((prev) => [...prev, ...batchCards]);
    await updateDeck(newDeck.id, { cardCount: batchCards.length });

    if (user && isOnline) {
      try {
        const batch = writeBatch(db);
        batchCards.forEach((c) => {
          batch.set(doc(db, 'decks', newDeck.id, 'cards', c.id), c);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Failed cloud batch write for explore copy:', err);
      }
    }

    return newDeck;
  };

  // --- Batch Import ---
  const importCardsToDeck = async (
    deckId: string,
    parsedCards: Array<{
      term: string;
      translation: string;
      exampleSentence?: string;
      exampleTranslation?: string;
      pronunciation?: string;
      transliteration?: string;
      usageNote?: string;
      tags?: string[];
    }>
  ): Promise<number> => {
    const now = new Date().toISOString();
    const newCards: Card[] = parsedCards.map((pc, idx) => ({
      id: 'card_imp_' + deckId + '_' + Date.now() + '_' + idx,
      deckId,
      ownerId,
      term: pc.term.trim(),
      translation: pc.translation.trim(),
      exampleSentence: pc.exampleSentence?.trim(),
      exampleTranslation: pc.exampleTranslation?.trim(),
      pronunciation: pc.pronunciation?.trim(),
      transliteration: pc.transliteration?.trim(),
      usageNote: pc.usageNote?.trim(),
      tags: pc.tags || [],
      srsState: { ...INITIAL_SRS_STATE, nextDueAt: now },
      createdAt: now,
      updatedAt: now,
    }));

    await localDB.saveCardsBatch(newCards);
    setCards((prev) => [...prev, ...newCards]);

    const parentDeck = decks.find((d) => d.id === deckId);
    if (parentDeck) {
      await updateDeck(deckId, { cardCount: (parentDeck.cardCount || 0) + newCards.length });
    }

    if (user && isOnline) {
      try {
        const batch = writeBatch(db);
        newCards.forEach((c) => {
          batch.set(doc(db, 'decks', deckId, 'cards', c.id), c);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Batch write failed during import:', err);
      }
    }

    return newCards.length;
  };

  // --- Backup & Restore ---
  const exportDataBackup = async (): Promise<string> => {
    const backupObj = {
      schemaVersion: 1,
      appName: '7ifd',
      exportedAt: new Date().toISOString(),
      user: {
        id: ownerId,
        email: profile?.email || '',
        displayName: profile?.displayName || '',
      },
      decks,
      cards,
      studyEvents,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const restoreDataBackup = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.appName || data.appName !== '7ifd' || !Array.isArray(data.decks) || !Array.isArray(data.cards)) {
        return { success: false, message: 'Invalid backup file format.' };
      }

      // Re-assign ownerId to current user to prevent cross-account isolation leak
      const restoredDecks: Deck[] = data.decks.map((d: Deck) => ({ ...d, ownerId }));
      const restoredCards: Card[] = data.cards.map((c: Card) => ({ ...c, ownerId }));
      const restoredEvents: StudyEvent[] = Array.isArray(data.studyEvents)
        ? data.studyEvents.map((e: StudyEvent) => ({ ...e, userId: ownerId }))
        : [];

      for (const d of restoredDecks) {
        await localDB.saveDeck(d);
      }
      if (restoredCards.length > 0) {
        await localDB.saveCardsBatch(restoredCards);
      }
      for (const e of restoredEvents) {
        await localDB.saveStudyEvent(e);
      }

      await loadData();
      return {
        success: true,
        message: `Restored ${restoredDecks.length} decks and ${restoredCards.length} cards successfully.`,
      };
    } catch (e) {
      return { success: false, message: 'Failed to parse JSON backup file.' };
    }
  };

  return (
    <SyncContext.Provider
      value={{
        decks,
        cards,
        studyEvents,
        stats,
        syncStatus,
        isOnline,
        createDeck,
        updateDeck,
        deleteDeck,
        duplicateDeck,
        createCard,
        updateCard,
        deleteCard,
        reviewCard,
        resetDeckSRS,
        copyExploreDeckToMyLearning,
        importCardsToDeck,
        syncNow,
        exportDataBackup,
        restoreDataBackup,
        refreshData: loadData,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
}
