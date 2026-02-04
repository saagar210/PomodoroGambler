// Pomodoro timer component

import { timerService } from '../services/TimerService.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { formatTime } from '../utils/formatters.js';
import { DURATIONS } from '../utils/constants.js';

class PomodoroTimer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedDuration = 15;
        this.render();
        this.attachListeners();
        this.initializeTimerState();
    }

    initializeTimerState() {
        // Check if timer is already running (resumed session)
        if (state.get('timer.isRunning')) {
            this.updateControlButton();
            this.updateDurationButtons();
            const elapsed = state.get('timer.elapsedSeconds') || 0;
            const duration = state.get('timer.duration') || 15;
            const total = duration * 60;
            this.updateTimerDisplay(elapsed, total);
        }
    }

    attachListeners() {
        // Duration selector buttons
        this.container.addEventListener('click', (e) => {
            const durationBtn = e.target.closest('.duration-btn');
            if (durationBtn && !state.get('timer.isRunning')) {
                const duration = parseInt(durationBtn.dataset.duration);
                this.selectedDuration = duration;
                this.updateDurationButtons();
            }
        });

        // Start/Stop button
        this.container.addEventListener('click', (e) => {
            const controlBtn = e.target.closest('.timer-control-btn');
            if (controlBtn) {
                if (state.get('timer.isRunning')) {
                    timerService.stopSession();
                } else {
                    timerService.startSession(this.selectedDuration);
                }
            }
        });

        // Timer events
        eventBus.on('timer:started', () => {
            this.updateControlButton();
            this.updateDurationButtons();
        });

        eventBus.on('timer:resumed', () => {
            this.updateControlButton();
            this.updateDurationButtons();
        });

        eventBus.on('timer:tick', ({ elapsed, total }) => {
            this.updateTimerDisplay(elapsed, total);
        });

        eventBus.on('session:completed', ({ coinsEarned }) => {
            this.updateControlButton();
            this.updateDurationButtons();
            this.showCompletionMessage(coinsEarned);
        });

        eventBus.on('session:stopped', () => {
            this.updateControlButton();
            this.updateDurationButtons();
            this.resetTimerDisplay();
        });

        eventBus.on('session:interrupted', () => {
            this.resetTimerDisplay();
        });
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

    updateDurationButtons() {
        const isRunning = state.get('timer.isRunning');
        const currentDuration = isRunning ? state.get('timer.duration') : this.selectedDuration;

        this.container.querySelectorAll('.duration-btn').forEach(btn => {
            const duration = parseInt(btn.dataset.duration);
            btn.classList.toggle('active', duration === currentDuration);
            btn.disabled = isRunning;
        });
    }

    updateControlButton() {
        const btn = this.container.querySelector('.timer-control-btn');
        const isRunning = state.get('timer.isRunning');

        if (isRunning) {
            btn.textContent = 'Stop Session';
            btn.className = 'btn btn-danger btn-lg timer-control-btn';
        } else {
            btn.textContent = 'Start Session';
            btn.className = 'btn btn-success btn-lg timer-control-btn';
        }
    }

    updateTimerDisplay(elapsed, total) {
        const remaining = Math.max(0, total - elapsed);
        const timeElement = this.container.querySelector('.timer-time');
        const progressCircle = this.container.querySelector('.timer-progress');

        if (timeElement) {
            timeElement.textContent = formatTime(remaining);
        }

        if (progressCircle) {
            const progress = (elapsed / total) * 100;
            const circumference = 2 * Math.PI * 140;
            const offset = circumference - (progress / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    resetTimerDisplay() {
        const duration = this.selectedDuration * 60;
        this.updateTimerDisplay(0, duration);
    }

    showCompletionMessage(coinsEarned) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<strong>Session Complete!</strong><br>You earned ${coinsEarned} coins!`;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);

        this.resetTimerDisplay();
    }

    render() {
        const config = this.getDurationConfig(this.selectedDuration);
        const totalSeconds = this.selectedDuration * 60;
        const circumference = 2 * Math.PI * 140;

        this.container.innerHTML = `
            <div class="timer-container">
                <div class="duration-selector">
                    <button class="duration-btn active" data-duration="15">
                        <div class="duration-time">15 min</div>
                        <div class="duration-multiplier">1x multiplier</div>
                        <div class="duration-coins">20 coins</div>
                    </button>
                    <button class="duration-btn" data-duration="30">
                        <div class="duration-time">30 min</div>
                        <div class="duration-multiplier">2x multiplier</div>
                        <div class="duration-coins">40 coins</div>
                    </button>
                    <button class="duration-btn" data-duration="60">
                        <div class="duration-time">60 min</div>
                        <div class="duration-multiplier">5x multiplier</div>
                        <div class="duration-coins">100 coins</div>
                    </button>
                </div>

                <div class="timer-display">
                    <svg class="timer-circle" viewBox="0 0 300 300">
                        <circle
                            cx="150"
                            cy="150"
                            r="140"
                            stroke="var(--color-bg-tertiary)"
                            stroke-width="10"
                            fill="none"
                        />
                        <circle
                            cx="150"
                            cy="150"
                            r="140"
                            stroke="var(--color-primary)"
                            stroke-width="10"
                            fill="none"
                            class="timer-progress"
                            style="
                                stroke-dasharray: ${circumference};
                                stroke-dashoffset: ${circumference};
                                transform: rotate(-90deg);
                                transform-origin: center;
                                transition: stroke-dashoffset 1s linear;
                            "
                        />
                    </svg>
                    <div class="timer-time">${formatTime(totalSeconds)}</div>
                    <div class="timer-info">Focus time</div>
                    <div class="timer-reward">Earn ${config.coins} coins</div>
                </div>

                <div class="timer-controls">
                    <button class="btn btn-success btn-lg timer-control-btn">
                        Start Session
                    </button>
                </div>
            </div>
        `;
    }
}

export function initPomodoroTimer() {
    return new PomodoroTimer('timer');
}
