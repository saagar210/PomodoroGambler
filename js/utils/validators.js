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
