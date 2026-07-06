/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'skrimchat_media_db';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('vibes')) {
        db.createObjectStore('vibes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pulses')) {
        db.createObjectStore('pulses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sparks')) {
        db.createObjectStore('sparks', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('IndexedDB open failed:', request.error);
      reject(request.error);
    };
  });
}

export async function saveRecord(store: 'vibes' | 'pulses' | 'sparks', record: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const request = os.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`IndexedDB save failed for store: ${store}`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`IndexedDB saveRecord got exception for store ${store}`, error);
    throw error;
  }
}

export async function getAllRecords(store: 'vibes' | 'pulses' | 'sparks'): Promise<any[]> {
  try {
    const db = await getDB();
    return new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const os = tx.objectStore(store);
      const request = os.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error(`IndexedDB getAll failed for store: ${store}`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`IndexedDB getAllRecords got exception for store ${store}`, error);
    return [];
  }
}

export async function deleteRecord(store: 'vibes' | 'pulses' | 'sparks', id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const request = os.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`IndexedDB delete failed for store: ${store}, id: ${id}`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`IndexedDB deleteRecord got exception for store ${store}, id: ${id}`, error);
    throw error;
  }
}
