// Lightweight analytics service for player-facing metrics.

import { database } from '../core/database.js';

class AnalyticsService {
    getSummary() {
        const sessionSummary = database.queryOne(`
            SELECT
                COUNT(*) AS total_sessions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_sessions,
                SUM(CASE WHEN status = 'interrupted' THEN 1 ELSE 0 END) AS interrupted_sessions,
                AVG(CASE WHEN status = 'completed' THEN duration_minutes END) AS avg_completed_duration
            FROM work_sessions
        `) || {};

        const betSummary = database.queryOne(`
            SELECT
                COUNT(*) AS total_bets,
                SUM(CASE WHEN outcome = 'pending' THEN 1 ELSE 0 END) AS pending_bets,
                SUM(CASE WHEN outcome != 'pending' THEN 1 ELSE 0 END) AS resolved_bets,
                SUM(CASE WHEN outcome = 'won' THEN 1 ELSE 0 END) AS won_bets,
                AVG(bet_amount) AS avg_bet_amount
            FROM betting_transactions
        `) || {};

        const totals = database.queryOne(`
            SELECT
                COALESCE(SUM(bet_amount), 0) AS total_spent,
                COALESCE(SUM(winnings), 0) AS total_winnings
            FROM betting_transactions
        `) || {};

        const totalSessions = Number(sessionSummary.total_sessions || 0);
        const completedSessions = Number(sessionSummary.completed_sessions || 0);
        const interruptedSessions = Number(sessionSummary.interrupted_sessions || 0);
        const completionRate = totalSessions > 0
            ? (completedSessions / totalSessions) * 100
            : 0;

        const resolvedBets = Number(betSummary.resolved_bets || 0);
        const wonBets = Number(betSummary.won_bets || 0);
        const winRate = resolvedBets > 0 ? (wonBets / resolvedBets) * 100 : 0;

        const totalSpent = Number(totals.total_spent || 0);
        const totalWinnings = Number(totals.total_winnings || 0);
        const roi = totalSpent > 0 ? ((totalWinnings - totalSpent) / totalSpent) * 100 : 0;

        return {
            totalSessions,
            completedSessions,
            interruptedSessions,
            completionRate,
            avgCompletedDuration: Number(sessionSummary.avg_completed_duration || 0),
            totalBets: Number(betSummary.total_bets || 0),
            pendingBets: Number(betSummary.pending_bets || 0),
            resolvedBets,
            wonBets,
            winRate,
            avgBetAmount: Number(betSummary.avg_bet_amount || 0),
            roi
        };
    }
}

export const analyticsService = new AnalyticsService();
