// Dashboard component

import { bettingService } from '../services/BettingService.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { EventCard } from './EventCard.js';
import { CATEGORIES } from '../utils/constants.js';

class Dashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentCategory = 'All';
        this.render();
        this.attachListeners();
    }

    attachListeners() {
        // Listen for balance updates to re-render bet buttons
        eventBus.on('balance:updated', () => {
            this.renderEvents();
        });

        // Listen for bet placement to re-render
        eventBus.on('bet:placed', () => {
            this.renderEvents();
            this.showToast('Bet placed successfully!', 'success');
        });

        // Listen for bet errors
        eventBus.on('bet:error', ({ message }) => {
            this.showToast(message, 'error');
        });

        // Filter buttons
        this.container.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-btn');
            if (!filterBtn) return;

            const category = filterBtn.dataset.category;
            this.currentCategory = category;
            this.updateFilters();
            this.renderEvents();
        });
    }

    updateFilters() {
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
    }

    renderEvents() {
        const eventsContainer = this.container.querySelector('.events-grid');
        if (!eventsContainer) return;

        const events = bettingService.getActiveEvents(
            this.currentCategory === 'All' ? null : this.currentCategory
        );

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎲</div>
                    <p class="empty-state-text">No events available</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = '';
        events.forEach(event => {
            const card = new EventCard(event);
            eventsContainer.appendChild(card.render());
        });
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 200ms ease';
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }

    render() {
        this.container.innerHTML = `
            <div class="filter-bar">
                ${CATEGORIES.map(cat => `
                    <button class="filter-btn ${cat === this.currentCategory ? 'active' : ''}" data-category="${cat}">
                        ${cat}
                    </button>
                `).join('')}
            </div>
            <div class="events-grid grid grid-auto"></div>
        `;

        this.renderEvents();
    }
}

export function initDashboard() {
    return new Dashboard('dashboard');
}
