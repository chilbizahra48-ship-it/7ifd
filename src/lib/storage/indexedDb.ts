import { Card, Deck, StudyEvent, UserProfile } from '../../types';

const DB_NAME = '7ifd_offline_storage_v1';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  type: 'deck' | 'card' | 'study_event' | 'user_profile';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

class LocalStorageDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // User profiles
        if (!db.objectStoreNames.contains('user_profiles')) {
          db.createObjectStore('user_profiles', { keyPath: 'id' });
        }

        // Decks
        if (!db.objectStoreNames.contains('decks')) {
          const deckStore = db.createObjectStore('decks', { keyPath: 'id' });
          deckStore.createIndex('ownerId', 'ownerId', { unique: false });
        }

        // Cards
        if (!db.objectStoreNames.contains('cards')) {
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('deckId', 'deckId', { unique: false });
          cardStore.createIndex('ownerId', 'ownerId', { unique: false });
        }

        // Study events
        if (!db.objectStoreNames.contains('study_events')) {
          const eventStore = db.createObjectStore('study_events', { keyPath: 'id' });
          eventStore.createIndex('userId', 'userId', { unique: false });
        }

        // Sync queue for offline mutations
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Decks ---
  async getDecks(ownerId: string): Promise<Deck[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('decks', 'readonly');
      const store = tx.objectStore('decks');
      const index = store.index('ownerId');
      const req = index.getAll(ownerId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getDeck(id: string): Promise<Deck | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('decks', 'readonly');
      const store = tx.objectStore('decks');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveDeck(deck: Deck): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('decks', 'readwrite');
      const store = tx.objectStore('decks');
      const req = store.put(deck);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDeck(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['decks', 'cards'], 'readwrite');
      const deckStore = tx.objectStore('decks');
      const cardStore = tx.objectStore('cards');
      const cardIndex = cardStore.index('deckId');

      deckStore.delete(id);

      const cardReq = cardIndex.getAllKeys(id);
      cardReq.onsuccess = () => {
        (cardReq.result || []).forEach((cardKey) => {
          cardStore.delete(cardKey);
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Cards ---
  async getCards(deckId: string): Promise<Card[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readonly');
      const store = tx.objectStore('cards');
      const index = store.index('deckId');
      const req = index.getAll(deckId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllUserCards(ownerId: string): Promise<Card[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readonly');
      const store = tx.objectStore('cards');
      const index = store.index('ownerId');
      const req = index.getAll(ownerId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveCard(card: Card): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readwrite');
      const store = tx.objectStore('cards');
      const req = store.put(card);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveCardsBatch(cards: Card[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readwrite');
      const store = tx.objectStore('cards');
      cards.forEach((c) => store.put(c));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteCard(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readwrite');
      const store = tx.objectStore('cards');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Study Events ---
  async saveStudyEvent(event: StudyEvent): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('study_events', 'readwrite');
      const store = tx.objectStore('study_events');
      const req = store.put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getStudyEvents(userId: string): Promise<StudyEvent[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('study_events', 'readonly');
      const store = tx.objectStore('study_events');
      const index = store.index('userId');
      const req = index.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // --- User Profile ---
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('user_profiles', 'readwrite');
      const store = tx.objectStore('user_profiles');
      const req = store.put(profile);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getUserProfile(id: string): Promise<UserProfile | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('user_profiles', 'readonly');
      const store = tx.objectStore('user_profiles');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Offline Sync Queue ---
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Clear all local data for a user on account deletion
  async clearUserData(userId: string): Promise<void> {
    const db = await this.initDB();
    const decks = await this.getDecks(userId);
    const cards = await this.getAllUserCards(userId);
    const events = await this.getStudyEvents(userId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['user_profiles', 'decks', 'cards', 'study_events'], 'readwrite');
      tx.objectStore('user_profiles').delete(userId);
      decks.forEach((d) => tx.objectStore('decks').delete(d.id));
      cards.forEach((c) => tx.objectStore('cards').delete(c.id));
      events.forEach((e) => tx.objectStore('study_events').delete(e.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const localDB = new LocalStorageDB();
