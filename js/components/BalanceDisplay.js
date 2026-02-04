// Balance display component

import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { formatCoins } from '../utils/formatters.js';

class BalanceDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.attachListeners();
    }

    attachListeners() {
        eventBus.on('balance:updated', () => {
            this.render();
        });
    }

    render() {
        const balance = state.get('currentBalance');

        this.container.innerHTML = `
            <div class="balance-display">
                <span class="balance-label">Balance:</span>
                <span class="balance-amount">${formatCoins(balance)}</span>
            </div>
        `;
    }
}

export function initBalanceDisplay() {
    return new BalanceDisplay('balance-display');
}
