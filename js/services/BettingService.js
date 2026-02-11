// Betting service with odds locking

import { database } from '../core/database.js';
import { balanceService } from './BalanceService.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { validateBalance, validateBetSide } from '../utils/validators.js';
import { BET_AMOUNT } from '../utils/constants.js';
import { BettingEvent } from '../models/BettingEvent.js';

class BettingService {
    async placeBet(eventId, betSide) {
        // Validate bet side
        if (!validateBetSide(betSide)) {
            eventBus.emit('bet:error', { message: 'Invalid bet side' });
            return false;
        }

        // Validate balance
        const currentBalance = state.get('currentBalance');
        if (!validateBalance(currentBalance, BET_AMOUNT)) {
            eventBus.emit('bet:error', { message: 'Insufficient coins. Complete more work sessions!' });
            return false;
        }

        // Get event and lock odds
        const eventData = database.getEvent(eventId);
        if (!eventData || !eventData.is_active) {
            eventBus.emit('bet:error', { message: 'Event not found or inactive' });
            return false;
        }

        const event = BettingEvent.fromDatabase(eventData);
        const oddsAtBet = betSide === 'yes' ? event.oddsYes : event.oddsNo;
        const potentialPayout = BET_AMOUNT / oddsAtBet;

        // Execute transaction atomically
        try {
            // Create betting transaction
            await database.createBettingTransaction(eventId, betSide, oddsAtBet, potentialPayout);

            // Deduct coins
            await balanceService.deductCoins(BET_AMOUNT);

            eventBus.emit('bet:placed', {
                eventTitle: event.title,
                betSide,
                betAmount: BET_AMOUNT,
                potentialPayout
            });

            return true;
        } catch (error) {
            eventBus.emit('bet:error', { message: 'Failed to place bet' });
            return false;
        }
    }


    async resolveEvent(eventId, winningSide) {
        if (!validateBetSide(winningSide)) {
            eventBus.emit('bet:error', { message: 'Invalid event outcome' });
            return false;
        }

        const eventData = database.getResolvableEvent(eventId);
        if (!eventData) {
            eventBus.emit('bet:error', { message: 'Event is already resolved or unavailable' });
            return false;
        }

        try {
            const pendingTransactions = database.getPendingTransactionsForEvent(eventId);
            let totalPayout = 0;
            let wonCount = 0;
            let lostCount = 0;

            pendingTransactions.forEach((transaction) => {
                const isWinner = transaction.bet_side === winningSide;
                const outcome = isWinner ? 'won' : 'lost';
                const winnings = isWinner ? Math.floor(transaction.potential_payout) : 0;
                const netProfit = isWinner
                    ? winnings - transaction.bet_amount
                    : -transaction.bet_amount;

                database.resolveTransaction(transaction.id, outcome, winnings, netProfit);

                if (isWinner) {
                    totalPayout += winnings;
                    wonCount += 1;
                } else {
                    lostCount += 1;
                }
            });

            if (totalPayout > 0) {
                await balanceService.addCoins(totalPayout);
            }

            await database.resolveEvent(eventId, winningSide);

            eventBus.emit('event:resolved', {
                eventId,
                eventTitle: eventData.title,
                winningSide,
                totalPayout,
                wonCount,
                lostCount
            });

            return true;
        } catch (error) {
            eventBus.emit('bet:error', { message: 'Failed to resolve event' });
            return false;
        }
    }

    getActiveEvents(category = null) {
        const eventsData = database.getActiveEvents(category);
        return eventsData.map(e => BettingEvent.fromDatabase(e));
    }

    async init() {
        const events = this.getActiveEvents();
        state.set('events', events);
    }
}

export const bettingService = new BettingService();
