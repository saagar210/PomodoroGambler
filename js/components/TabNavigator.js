// Tab navigation component

import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { TABS } from '../utils/constants.js';

class TabNavigator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
        this.attachListeners();
    }

    attachListeners() {
        this.container.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (!tabBtn) return;

            const tab = tabBtn.dataset.tab;
            this.switchTab(tab);
        });

        eventBus.on('tab:changed', ({ tab }) => {
            this.updateActiveTab(tab);
        });
    }

    switchTab(tab) {
        state.set('activeTab', tab);
        this.updateActiveTab(tab);
        eventBus.emit('tab:changed', { tab });
    }

    updateActiveTab(tab) {
        // Update button states
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tab);
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="tab-nav">
                <button class="tab-btn active" data-tab="${TABS.DASHBOARD}">Dashboard</button>
                <button class="tab-btn" data-tab="${TABS.TIMER}">Pomodoro Timer</button>
                <button class="tab-btn" data-tab="${TABS.HISTORY}">History</button>
            </div>
        `;
        // Activate the default tab
        this.updateActiveTab(TABS.DASHBOARD);
    }
}

export function initTabNavigator() {
    return new TabNavigator('tab-navigator');
}
