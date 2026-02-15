// Validation utilities

import { BET_AMOUNT } from './constants.js';

export function validateBalance(balance, requiredAmount = BET_AMOUNT) {
    return balance >= requiredAmount;
}

export function validateBetSide(side) {
    return side === 'yes' || side === 'no';
}

export function validateDuration(minutes) {
    return [15, 30, 60].includes(minutes);
}

export function validateOdds(odds) {
    return odds > 0 && odds <= 1;
}

export function validateEventId(eventId) {
    return Number.isInteger(eventId) && eventId > 0;
}

export function validateBetAmount(amount, minBet = 10, maxBet = 1000) {
    if (!Number.isInteger(amount)) {
        return { valid: false, error: 'Bet must be whole number' };
    }
    if (amount < minBet) {
        return { valid: false, error: `Minimum bet: ${minBet} coins` };
    }
    if (amount > maxBet) {
        return { valid: false, error: `Maximum bet: ${maxBet} coins` };
    }
    return { valid: true };
}
