// Application state management

import { eventBus } from './eventbus.js';
import { BET_AMOUNT, TABS } from '../utils/constants.js';

class State {
    constructor() {
        this.data = {
            currentBalance: 0,
            betAmount: BET_AMOUNT,
            activeTab: TABS.DASHBOARD,
            timer: {
                isRunning: false,
                isPaused: false,
                startTime: null,
                duration: 15,
                multiplier: 1,
                elapsedSeconds: 0,
                pausedAtSeconds: 0
            },
            events: [],
            history: {
                sessions: [],
                bets: []
            },
            user: null
        };
    }

    get(key) {
        if (key.includes('.')) {
            const keys = key.split('.');
            let value = this.data;
            for (const k of keys) {
                value = value[k];
                if (value === undefined) return undefined;
            }
            return value;
        }
        return this.data[key];
    }

    set(key, value) {
        if (key.includes('.')) {
            const keys = key.split('.');
            let obj = this.data;
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
        } else {
            this.data[key] = value;
        }

        eventBus.emit('state:changed', { key, value });
    }

    update(key, updater) {
        const currentValue = this.get(key);
        const newValue = updater(currentValue);
        this.set(key, newValue);
    }

    getAll() {
        return { ...this.data };
    }
}

export const state = new State();
