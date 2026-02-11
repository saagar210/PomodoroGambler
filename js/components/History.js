// History component

import { historyService } from '../services/HistoryService.js';
import { eventBus } from '../core/eventbus.js';
import { formatDateTime, formatCoins, formatDuration, formatPayout } from '../utils/formatters.js';

class History {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeTab = 'sessions';
        this.currentPage = { sessions: 1, bets: 1 };
        this.render();
        this.attachListeners();
    }

    attachListeners() {
        // Tab switching
        this.container.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.history-tab-btn');
            if (tabBtn) {
                this.activeTab = tabBtn.dataset.tab;
                this.updateHistoryTabs();
                this.renderActiveTab();
            }
        });

        // Pagination
        this.container.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.page-btn');
            if (pageBtn) {
                const page = parseInt(pageBtn.dataset.page, 10);
                this.currentPage[this.activeTab] = page;
                this.renderActiveTab();
            }
        });

        // Resolve event action
        this.container.addEventListener('click', async (e) => {
            const resolveBtn = e.target.closest('.resolve-btn');
            if (!resolveBtn) return;

            resolveBtn.disabled = true;

            const eventId = parseInt(resolveBtn.dataset.eventId, 10);
            const winningSide = resolveBtn.dataset.outcome;
            const resolved = await historyService.resolveEvent(eventId, winningSide);

            if (resolved) {
                this.renderActiveTab();
                this.renderStats();
                this.showToast(`Event resolved: ${winningSide.toUpperCase()} won`, 'success');
            } else {
                resolveBtn.disabled = false;
            }
        });

        // Listen for new sessions/bets
        eventBus.on('session:completed', () => {
            this.renderActiveTab();
            this.renderStats();
        });

        eventBus.on('bet:placed', () => {
            this.renderActiveTab();
            this.renderStats();
        });

        eventBus.on('event:resolved', ({ eventTitle, totalPayout }) => {
            this.renderActiveTab();
            this.renderStats();
            this.showToast(`${eventTitle} settled. Payout: ${formatCoins(totalPayout)}`, 'success');
        });

        eventBus.on('bet:error', ({ message }) => {
            this.showToast(message, 'error');
        });
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 200ms ease';
            setTimeout(() => toast.remove(), 200);
        }, 3200);
    }

    updateHistoryTabs() {
        this.container.querySelectorAll('.history-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
        });

        this.container.querySelectorAll('.history-content').forEach(content => {
            content.classList.toggle('active', content.classList.contains(`${this.activeTab}-content`));
        });
    }

    renderStats() {
        const statsContainer = this.container.querySelector('.stats-grid');
        if (!statsContainer) return;

        const stats = historyService.getStatistics();
        const netProfit = stats.totalEarned - stats.totalSpent + stats.totalWinnings;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value positive">${formatCoins(stats.totalEarned)}</div>
                <div class="stat-label">Total Earned</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatCoins(stats.totalSpent)}</div>
                <div class="stat-label">Total Spent</div>
            </div>
            <div class="stat-card">
                <div class="stat-value positive">${formatCoins(stats.totalWinnings)}</div>
                <div class="stat-label">Total Winnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value ${netProfit >= 0 ? 'positive' : 'negative'}">${netProfit >= 0 ? '+' : ''}${formatCoins(netProfit)}</div>
                <div class="stat-label">Net Profit/Loss</div>
            </div>
        `;
    }

    renderSessionsTable() {
        const container = this.container.querySelector('.sessions-content');
        if (!container) return;

        const { sessions, page, totalPages } = historyService.getWorkSessions(this.currentPage.sessions);

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⏱️</div>
                    <p class="empty-state-text">No work sessions yet. Start a timer to earn coins!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Multiplier</th>
                            <th>Coins Earned</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessions.map(session => `
                            <tr>
                                <td>${formatDateTime(session.createdAt)}</td>
                                <td>${formatDuration(session.durationMinutes)}</td>
                                <td>${session.multiplier}x</td>
                                <td>${formatCoins(session.coinsEarned)}</td>
                                <td>
                                    <span class="badge badge-${session.status === 'completed' ? 'tech' : 'sports'}">
                                        ${session.status}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(page, totalPages)}
        `;
    }

    renderOutcomeBadge(outcome) {
        const statusClassMap = {
            pending: 'sports',
            won: 'tech',
            lost: 'politics'
        };

        return `<span class="badge badge-${statusClassMap[outcome] || 'sports'}">${outcome}</span>`;
    }

    renderResolutionActions(tx) {
        if (tx.outcome !== 'pending') {
            return '<span class="resolve-note">Resolved</span>';
        }

        return `
            <div class="resolve-actions">
                <button class="resolve-btn yes" data-event-id="${tx.eventId}" data-outcome="yes">Resolve YES</button>
                <button class="resolve-btn no" data-event-id="${tx.eventId}" data-outcome="no">Resolve NO</button>
            </div>
        `;
    }

    renderBetsTable() {
        const container = this.container.querySelector('.bets-content');
        if (!container) return;

        const { transactions, page, totalPages } = historyService.getBettingTransactions(this.currentPage.bets);

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎲</div>
                    <p class="empty-state-text">No bets placed yet. Check out the Dashboard to place your first bet!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Event</th>
                            <th>Bet Side</th>
                            <th>Amount</th>
                            <th>Odds</th>
                            <th>Potential Payout</th>
                            <th>Status</th>
                            <th>Resolve</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(tx => `
                            <tr>
                                <td>${formatDateTime(tx.createdAt)}</td>
                                <td>${tx.eventTitle}</td>
                                <td>
                                    <span class="badge badge-${tx.betSide === 'yes' ? 'tech' : 'gaming'}">
                                        ${tx.betSide.toUpperCase()}
                                    </span>
                                </td>
                                <td>${formatCoins(tx.betAmount)}</td>
                                <td>${(tx.oddsAtBet * 100).toFixed(0)}%</td>
                                <td>${formatPayout(tx.potentialPayout)}</td>
                                <td>${this.renderOutcomeBadge(tx.outcome)}</td>
                                <td>${this.renderResolutionActions(tx)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(page, totalPages)}
        `;
    }

    renderPagination(currentPage, totalPages) {
        if (totalPages <= 1) return '';

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return `
            <div class="pagination">
                <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                ${pages.map(page => `
                    <button class="page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">
                        ${page}
                    </button>
                `).join('')}
                <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        `;
    }

    renderActiveTab() {
        if (this.activeTab === 'sessions') {
            this.renderSessionsTable();
        } else {
            this.renderBetsTable();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="stats-grid"></div>

            <div class="history-tabs">
                <button class="history-tab-btn active" data-tab="sessions">Work Sessions</button>
                <button class="history-tab-btn" data-tab="bets">Betting History</button>
            </div>

            <div class="history-content sessions-content active"></div>
            <div class="history-content bets-content"></div>
        `;

        this.renderStats();
        this.renderActiveTab();
    }
}

export function initHistory() {
    return new History('history');
}
