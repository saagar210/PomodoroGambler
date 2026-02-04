// Balance service

import { database } from '../core/database.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';

class BalanceService {
    getBalance() {
        return database.getBalance();
    }

    async addCoins(amount) {
        const newBalance = await database.updateBalance(amount);
        state.set('currentBalance', newBalance);
        eventBus.emit('balance:updated', { balance: newBalance, change: amount });
        return newBalance;
    }

    async deductCoins(amount) {
        return await this.addCoins(-amount);
    }

    async init() {
        const balance = this.getBalance();
        state.set('currentBalance', balance);
    }
}

export const balanceService = new BalanceService();
