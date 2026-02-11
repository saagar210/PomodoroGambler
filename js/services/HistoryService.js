// History service

import { database } from '../core/database.js';
import { WorkSession } from '../models/WorkSession.js';
import { Transaction } from '../models/Transaction.js';
import { ITEMS_PER_PAGE } from '../utils/constants.js';
import { bettingService } from './BettingService.js';

class HistoryService {
    getWorkSessions(page = 1) {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const sessionsData = database.getWorkSessions(ITEMS_PER_PAGE, offset);
        const sessions = sessionsData.map(s => WorkSession.fromDatabase(s));
        const total = database.getTotalWorkSessionsCount();

        return {
            sessions,
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE)
        };
    }

    getBettingTransactions(page = 1) {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const transactionsData = database.getBettingTransactions(ITEMS_PER_PAGE, offset);
        const transactions = transactionsData.map(t => Transaction.fromDatabase(t));
        const total = database.getTotalBettingTransactionsCount();

        return {
            transactions,
            total,
            page,
            totalPages: Math.ceil(total / ITEMS_PER_PAGE)
        };
    }


    async resolveEvent(eventId, winningSide) {
        return bettingService.resolveEvent(eventId, winningSide);
    }

    getStatistics() {
        return {
            totalEarned: database.getTotalCoinsEarned(),
            totalSpent: database.getTotalCoinsSpent(),
            totalWinnings: database.getTotalWinnings(),
            netProfit: database.getNetProfit()
        };
    }
}

export const historyService = new HistoryService();
