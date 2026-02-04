// IndexedDB wrapper for persistence

import { STORAGE_KEYS } from '../utils/constants.js';

class Storage {
    constructor() {
        this.dbName = 'AuraFlowDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store for SQLite database
                if (!db.objectStoreNames.contains('database')) {
                    db.createObjectStore('database');
                }

                // Create object store for timer state
                if (!db.objectStoreNames.contains('timer')) {
                    db.createObjectStore('timer');
                }
            };
        });
    }

    async saveDatabase(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['database'], 'readwrite');
            const store = transaction.objectStore('database');
            const request = store.put(data, STORAGE_KEYS.DB);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async loadDatabase() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['database'], 'readonly');
            const store = transaction.objectStore('database');
            const request = store.get(STORAGE_KEYS.DB);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async saveTimerState(timerState) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['timer'], 'readwrite');
            const store = transaction.objectStore('timer');
            const request = store.put(timerState, STORAGE_KEYS.TIMER_STATE);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async loadTimerState() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['timer'], 'readonly');
            const store = transaction.objectStore('timer');
            const request = store.get(STORAGE_KEYS.TIMER_STATE);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async clearTimerState() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['timer'], 'readwrite');
            const store = transaction.objectStore('timer');
            const request = store.delete(STORAGE_KEYS.TIMER_STATE);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

export const storage = new Storage();
