// Event card component

import { bettingService } from '../services/BettingService.js';
import { state } from '../core/state.js';
import { formatPercentage } from '../utils/formatters.js';
import { validateBalance } from '../utils/validators.js';
import { BET_AMOUNT } from '../utils/constants.js';

export class EventCard {
    constructor(event) {
        this.event = event;
    }

    canPlaceBet() {
        const balance = state.get('currentBalance');
        return validateBalance(balance, BET_AMOUNT);
    }

    handleBet(betSide) {
        bettingService.placeBet(this.event.id, betSide);
    }

    render() {
        const canBet = this.canPlaceBet();
        const disabledAttr = canBet ? '' : 'disabled';
        const categoryClass = this.event.category.toLowerCase();

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-header">
                <h3 class="event-title">${this.event.title}</h3>
                <span class="badge badge-${categoryClass}">${this.event.category}</span>
            </div>
            <p class="event-description">${this.event.description || ''}</p>
            <div class="event-odds">
                <div class="odds-item">
                    <div class="odds-label">YES</div>
                    <div class="odds-value yes">${formatPercentage(this.event.oddsYes)}</div>
                </div>
                <div class="odds-item">
                    <div class="odds-label">NO</div>
                    <div class="odds-value no">${formatPercentage(this.event.oddsNo)}</div>
                </div>
            </div>
            <div class="event-actions">
                <button class="bet-btn yes" data-side="yes" ${disabledAttr}>
                    Bet YES (${BET_AMOUNT} coins)
                </button>
                <button class="bet-btn no" data-side="no" ${disabledAttr}>
                    Bet NO (${BET_AMOUNT} coins)
                </button>
            </div>
        `;

        // Attach event listeners
        card.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const side = btn.dataset.side;
                this.handleBet(side);
            });
        });

        return card;
    }
}
