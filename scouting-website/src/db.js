import { openDB } from 'idb';

// Initialize IndexedDB for offline storage
export const dbPromise = openDB('scouting-db', 1, {
  upgrade(db) {
    
    // Create object stores for match and pit scouting queues
    if (!db.objectStoreNames.contains('matchQueue')) {
      db.createObjectStore('matchQueue', {
        keyPath: 'localId',
        autoIncrement: true,
      });
    }

    if (!db.objectStoreNames.contains('pitQueue')) {
      db.createObjectStore('pitQueue', {
        keyPath: 'localId',
        autoIncrement: true,
      });
    }
  },
});
