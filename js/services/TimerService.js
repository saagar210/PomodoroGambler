// Timer service with interruption detection

import { storage } from '../core/storage.js';
import { database } from '../core/database.js';
import { balanceService } from './BalanceService.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { DURATIONS, GRACE_PERIOD_MS, SESSION_STATUS } from '../utils/constants.js';

class TimerService {
    constructor() {
        this.intervalId = null;
        this.startTime = null;
        this.duration = 15; // minutes
        this.multiplier = 1;
    }

    async init() {
        // Check for interrupted session
        await this.checkInterruption();
    }

    async checkInterruption() {
        const timerState = await storage.loadTimerState();

        if (!timerState) return;

        const { startTime, duration, expectedEndTime } = timerState;
        const now = Date.now();

        // Check if session was interrupted (past expected end time + grace period)
        if (now > expectedEndTime + GRACE_PERIOD_MS) {
            // Session was interrupted, don't award coins
            const start = new Date(startTime).toISOString();
            const end = new Date(now).toISOString();

            await database.createWorkSession(
                start,
                end,
                duration,
                this.getDurationConfig(duration).multiplier,
                0,
                SESSION_STATUS.INTERRUPTED
            );

            await storage.clearTimerState();
            eventBus.emit('session:interrupted');
        } else if (now >= expectedEndTime) {
            // Session completed while browser was closed
            await this.completeSession(startTime, duration);
        } else {
            // Session still active, resume it
            const elapsed = Math.floor((now - startTime) / 1000);
            this.resumeSession(startTime, duration, elapsed);
        }
    }

    getDurationConfig(minutes) {
        switch (minutes) {
            case 15:
                return DURATIONS.SHORT;
            case 30:
                return DURATIONS.MEDIUM;
            case 60:
                return DURATIONS.LONG;
            default:
                return DURATIONS.SHORT;
        }
    }

    async startSession(durationMinutes) {
        if (state.get('timer.isRunning')) return;

        const config = this.getDurationConfig(durationMinutes);
        this.startTime = Date.now();
        this.duration = durationMinutes;
        this.multiplier = config.multiplier;

        const expectedEndTime = this.startTime + (durationMinutes * 60 * 1000);

        // Save timer state to storage
        await storage.saveTimerState({
            startTime: this.startTime,
            duration: durationMinutes,
            expectedEndTime: expectedEndTime
        });

        // Update state
        state.set('timer', {
            isRunning: true,
            startTime: this.startTime,
            duration: durationMinutes,
            multiplier: this.multiplier,
            elapsedSeconds: 0
        });

        // Start interval
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        eventBus.emit('timer:started', { duration: durationMinutes, multiplier: this.multiplier });
    }

    resumeSession(startTime, duration, elapsedSeconds) {
        const config = this.getDurationConfig(duration);
        this.startTime = startTime;
        this.duration = duration;
        this.multiplier = config.multiplier;

        state.set('timer', {
            isRunning: true,
            startTime: startTime,
            duration: duration,
            multiplier: this.multiplier,
            elapsedSeconds: elapsedSeconds
        });

        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        eventBus.emit('timer:resumed', { duration: duration, multiplier: this.multiplier });
    }

    tick() {
        const now = Date.now();
        const elapsed = Math.floor((now - this.startTime) / 1000);
        const totalSeconds = this.duration * 60;

        state.set('timer.elapsedSeconds', elapsed);

        if (elapsed >= totalSeconds) {
            this.completeSession(this.startTime, this.duration);
        }

        eventBus.emit('timer:tick', { elapsed, total: totalSeconds });
    }

    async completeSession(startTime, duration) {
        // Clear interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const config = this.getDurationConfig(duration);
        const coinsEarned = config.coins;

        // Record work session
        const start = new Date(startTime).toISOString();
        const end = new Date().toISOString();

        await database.createWorkSession(
            start,
            end,
            duration,
            config.multiplier,
            coinsEarned,
            SESSION_STATUS.COMPLETED
        );

        // Award coins
        await balanceService.addCoins(coinsEarned);

        // Clear timer state
        await storage.clearTimerState();

        // Reset state
        state.set('timer', {
            isRunning: false,
            startTime: null,
            duration: 15,
            multiplier: 1,
            elapsedSeconds: 0
        });

        eventBus.emit('session:completed', { coinsEarned, duration, multiplier: config.multiplier });
    }

    async stopSession() {
        if (!state.get('timer.isRunning')) return;

        // Mark as interrupted
        const start = new Date(this.startTime).toISOString();
        const end = new Date().toISOString();

        await database.createWorkSession(
            start,
            end,
            this.duration,
            this.multiplier,
            0,
            SESSION_STATUS.INTERRUPTED
        );

        // Clear interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Clear timer state
        await storage.clearTimerState();

        // Reset state
        state.set('timer', {
            isRunning: false,
            startTime: null,
            duration: 15,
            multiplier: 1,
            elapsedSeconds: 0
        });

        eventBus.emit('session:stopped');
    }
}

export const timerService = new TimerService();
