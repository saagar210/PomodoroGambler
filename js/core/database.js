// SQLite database manager using sql.js

import { storage } from './storage.js';
import { STARTING_BALANCE } from '../utils/constants.js';

class Database {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    async init() {
        // Initialize sql.js
        this.SQL = await initSqlJs({
            locateFile: file => `lib/${file}`
        });

        // Try to load existing database from IndexedDB
        const savedDb = await storage.loadDatabase();

        if (savedDb) {
            // Load existing database
            this.db = new this.SQL.Database(new Uint8Array(savedDb));
        } else {
            // Create new database
            this.db = new this.SQL.Database();
            await this.createSchema();
            await this.seedInitialData();
            await this.save();
        }
    }

    async createSchema() {
        // Users table
        this.db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT DEFAULT 'Player',
                total_coins_earned INTEGER DEFAULT 0,
                total_coins_spent INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Work sessions table
        this.db.run(`
            CREATE TABLE work_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT 1,
                start_time TEXT NOT NULL,
                end_time TEXT,
                duration_minutes INTEGER NOT NULL,
                multiplier REAL NOT NULL,
                coins_earned INTEGER NOT NULL,
                status TEXT DEFAULT 'completed',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Betting events table
        this.db.run(`
            CREATE TABLE betting_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                odds_yes REAL NOT NULL,
                odds_no REAL NOT NULL,
                outcome TEXT,
                resolution_date TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Betting transactions table
        this.db.run(`
            CREATE TABLE betting_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER DEFAULT 1,
                event_id INTEGER NOT NULL,
                bet_amount INTEGER DEFAULT 40,
                bet_side TEXT NOT NULL,
                odds_at_bet REAL NOT NULL,
                potential_payout REAL NOT NULL,
                outcome TEXT DEFAULT 'pending',
                winnings INTEGER DEFAULT 0,
                net_profit INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                resolved_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (event_id) REFERENCES betting_events(id)
            )
        `);

        // Coin balance table
        this.db.run(`
            CREATE TABLE coin_balance (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                balance INTEGER DEFAULT 0,
                last_updated TEXT DEFAULT (datetime('now'))
            )
        `);

        // Create indexes
        this.db.run('CREATE INDEX idx_work_sessions_created ON work_sessions(created_at DESC)');
        this.db.run('CREATE INDEX idx_betting_transactions_created ON betting_transactions(created_at DESC)');
        this.db.run('CREATE INDEX idx_betting_events_active ON betting_events(is_active, created_at DESC)');
    }

    async seedInitialData() {
        // Create default user
        this.db.run(`INSERT INTO users (name) VALUES ('Player')`);

        // Set starting balance
        this.db.run(`INSERT INTO coin_balance (id, balance) VALUES (1, ${STARTING_BALANCE})`);

        // Load and insert initial events
        const response = await fetch('js/data/initial-events.json');
        const events = await response.json();

        const stmt = this.db.prepare(`
            INSERT INTO betting_events (title, description, category, odds_yes, odds_no, resolution_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const event of events) {
            stmt.run([
                event.title,
                event.description,
                event.category,
                event.odds_yes,
                event.odds_no,
                event.resolution_date
            ]);
        }

        stmt.free();
    }

    async save() {
        const data = this.db.export();
        await storage.saveDatabase(data);
    }

    query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        const result = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            result.push(row);
        }

        stmt.free();
        return result;
    }

    queryOne(sql, params = []) {
        const results = this.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    run(sql, params = []) {
        const stmt = this.db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        stmt.step();
        stmt.free();
    }

    async execute(sql, params = []) {
        this.run(sql, params);
        await this.save();
    }

    // User methods
    getUser() {
        return this.queryOne('SELECT * FROM users WHERE id = 1');
    }

    // Balance methods
    getBalance() {
        const result = this.queryOne('SELECT balance FROM coin_balance WHERE id = 1');
        return result ? result.balance : 0;
    }

    async updateBalance(amount) {
        this.run(`
            UPDATE coin_balance
            SET balance = balance + ?, last_updated = datetime('now')
            WHERE id = 1
        `, [amount]);
        await this.save();
        return this.getBalance();
    }

    // Work session methods
    async createWorkSession(startTime, endTime, durationMinutes, multiplier, coinsEarned, status = 'completed') {
        this.run(`
            INSERT INTO work_sessions (start_time, end_time, duration_minutes, multiplier, coins_earned, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [startTime, endTime, durationMinutes, multiplier, coinsEarned, status]);
        await this.save();
    }

    getWorkSessions(limit = 10, offset = 0) {
        return this.query(`
            SELECT * FROM work_sessions
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
    }

    getTotalWorkSessionsCount() {
        const result = this.queryOne('SELECT COUNT(*) as count FROM work_sessions');
        return result ? result.count : 0;
    }

    // Betting event methods
    getActiveEvents(category = null) {
        if (category && category !== 'All') {
            return this.query(`
                SELECT * FROM betting_events
                WHERE is_active = 1 AND category = ?
                ORDER BY created_at DESC
            `, [category]);
        }
        return this.query('SELECT * FROM betting_events WHERE is_active = 1 ORDER BY created_at DESC');
    }

    getEvent(eventId) {
        return this.queryOne('SELECT * FROM betting_events WHERE id = ?', [eventId]);
    }


    getResolvableEvent(eventId) {
        return this.queryOne(
            'SELECT * FROM betting_events WHERE id = ? AND is_active = 1 AND outcome IS NULL',
            [eventId]
        );
    }

    // Betting transaction methods
    async createBettingTransaction(eventId, betSide, oddsAtBet, potentialPayout) {
        this.run(`
            INSERT INTO betting_transactions (event_id, bet_side, odds_at_bet, potential_payout)
            VALUES (?, ?, ?, ?)
        `, [eventId, betSide, oddsAtBet, potentialPayout]);
        await this.save();
    }

    getBettingTransactions(limit = 10, offset = 0) {
        return this.query(`
            SELECT
                bt.*,
                be.title as event_title,
                be.category as event_category
            FROM betting_transactions bt
            JOIN betting_events be ON bt.event_id = be.id
            ORDER BY bt.created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
    }

    getTotalBettingTransactionsCount() {
        const result = this.queryOne('SELECT COUNT(*) as count FROM betting_transactions');
        return result ? result.count : 0;
    }


    getPendingTransactionsForEvent(eventId) {
        return this.query(`
            SELECT * FROM betting_transactions
            WHERE event_id = ? AND outcome = 'pending'
            ORDER BY created_at ASC
        `, [eventId]);
    }

    resolveTransaction(transactionId, outcome, winnings, netProfit) {
        this.run(`
            UPDATE betting_transactions
            SET outcome = ?, winnings = ?, net_profit = ?, resolved_at = datetime('now')
            WHERE id = ?
        `, [outcome, winnings, netProfit, transactionId]);
    }

    async resolveEvent(eventId, winningSide) {
        this.run(`
            UPDATE betting_events
            SET outcome = ?, is_active = 0, resolution_date = datetime('now')
            WHERE id = ?
        `, [winningSide, eventId]);
        await this.save();
    }

    // Statistics methods
    getTotalCoinsEarned() {
        const result = this.queryOne('SELECT COALESCE(SUM(coins_earned), 0) as total FROM work_sessions WHERE status = "completed"');
        return result ? result.total : 0;
    }

    getTotalCoinsSpent() {
        const result = this.queryOne('SELECT COALESCE(SUM(bet_amount), 0) as total FROM betting_transactions');
        return result ? result.total : 0;
    }

    getTotalWinnings() {
        const result = this.queryOne('SELECT COALESCE(SUM(winnings), 0) as total FROM betting_transactions WHERE outcome = "won"');
        return result ? result.total : 0;
    }

    getNetProfit() {
        const result = this.queryOne('SELECT COALESCE(SUM(net_profit), 0) as total FROM betting_transactions');
        return result ? result.total : 0;
    }
}

export const database = new Database();
