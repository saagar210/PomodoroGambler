// Dashboard component

import { bettingService } from '../services/BettingService.js';
import { eventCreationService } from '../services/EventCreationService.js';
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

        // Listen for new events
        eventBus.on('event:created', () => {
            this.renderEvents();
        });

        // Create event button
        this.container.addEventListener('click', async (e) => {
            if (e.target.id === 'create-event-btn') {
                await this.createEventPrompt();
            }
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

    async createEventPrompt() {
        const title = prompt('Event title:');
        if (!title) return;

        const category = prompt('Category (Sports/Tech/Gaming/Politics/Custom):') || 'Custom';
        const description = prompt('Description (optional):') || '';

        const yesOddsStr = prompt('YES odds (e.g., 0.65 for 65%):');
        const yesOdds = parseFloat(yesOddsStr);

        const noOddsStr = prompt('NO odds (e.g., 0.35 for 35%):');
        const noOdds = parseFloat(noOddsStr);

        if (isNaN(yesOdds) || isNaN(noOdds)) {
            this.showToast('Invalid odds values', 'error');
            return;
        }

        try {
            await eventCreationService.createEvent(title, category, description, yesOdds, noOdds);
            this.showToast(`Event "${title}" created!`, 'success');
        } catch (err) {
            this.showToast(`Error: ${err.message}`, 'error');
        }
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
            <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="filter-bar">
                    ${CATEGORIES.map(cat => `
                        <button class="filter-btn ${cat === this.currentCategory ? 'active' : ''}" data-category="${cat}">
                            ${cat}
                        </button>
                    `).join('')}
                </div>
                <button id="create-event-btn" class="btn btn-primary btn-sm">+ Create Event</button>
            </div>
            <div class="events-grid grid grid-auto"></div>
        `;

        this.renderEvents();
    }
}

export function initDashboard() {
    return new Dashboard('dashboard');
}
