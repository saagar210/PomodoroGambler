// Export user data in multiple formats

import { database } from '../core/database.js';

class DataExportService {
    constructor() {
        this.database = database;
    }

    /**
     * Export all sessions and bets as JSON
     * @returns {Promise<string>} JSON string
     */
    async exportAsJSON() {
        const sessions = await this.database.query(
            'SELECT * FROM work_sessions ORDER BY created_at DESC'
        );
        const bets = await this.database.query(
            `SELECT bt.*, be.title as event_title, be.category as event_category
             FROM betting_transactions bt
             LEFT JOIN betting_events be ON bt.event_id = be.id
             ORDER BY bt.created_at DESC`
        );
        const balance = await this.database.query(
            'SELECT * FROM coin_balance LIMIT 1'
        );

        const data = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            sessions: sessions,
            bets: bets,
            balance: balance[0] || null
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Export sessions as CSV
     * @returns {Promise<string>} CSV string
     */
    async exportSessionsAsCSV() {
        const sessions = await this.database.query(
            'SELECT * FROM work_sessions ORDER BY created_at DESC'
        );

        if (sessions.length === 0) {
            return 'No sessions to export';
        }

        const headers = ['ID', 'Date', 'Duration (min)', 'Multiplier', 'Coins Earned', 'Status'];
        const rows = sessions.map(s => [
            s.id,
            s.created_at,
            s.duration_minutes,
            s.multiplier,
            s.coins_earned,
            s.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => this.csvEscape(cell)).join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Export bets as CSV
     * @returns {Promise<string>} CSV string
     */
    async exportBetsAsCSV() {
        const bets = await this.database.query(
            `SELECT bt.*, be.title as event_title, be.category as event_category
             FROM betting_transactions bt
             LEFT JOIN betting_events be ON bt.event_id = be.id
             ORDER BY bt.created_at DESC`
        );

        if (bets.length === 0) {
            return 'No bets to export';
        }

        const headers = ['ID', 'Date', 'Event', 'Category', 'Bet Side', 'Amount', 'Odds', 'Potential Payout', 'Actual Payout', 'Status'];
        const rows = bets.map(b => [
            b.id,
            b.created_at,
            b.event_title || 'Unknown',
            b.event_category || 'Unknown',
            b.bet_side,
            b.bet_amount,
            b.odds_at_bet,
            b.potential_payout,
            b.winnings,
            b.outcome
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => this.csvEscape(cell)).join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Escape CSV values (quote strings containing commas)
     * @param {*} value
     * @returns {string}
     */
    csvEscape(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Trigger browser download
     * @param {string} content File content
     * @param {string} filename File name
     * @param {string} mimeType MIME type
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Delete all user data (sessions, bets, balance reset to 100)
     * @returns {Promise<void>}
     */
    async deleteAllData() {
        // Confirm user action
        const confirmed = window.confirm(
            'This will delete all sessions and bets. This action cannot be undone. Continue?'
        );
        if (!confirmed) return false;

        // Delete all sessions
        this.database.run('DELETE FROM work_sessions');

        // Delete all bets
        this.database.run('DELETE FROM betting_transactions');

        // Reset balance to 100
        this.database.run('UPDATE coin_balance SET balance = 100, last_updated = datetime(\'now\') WHERE id = 1');
        await this.database.save();

        return true;
    }
}

export const dataExportService = new DataExportService();
